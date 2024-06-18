import { ISendNotificationInputOptions } from '../types';
import {
  getPayloadForAPIInput,
  getPayloadIdentity,
  getRecipients,
  getRecipientFieldForAPIPayload,
  getVerificationProof,
  getSource,
  getUUID,
} from './helpers';
import {
  getAPIBaseUrls,
  getCAIPAddress,
  getCAIPDetails,
  getConfig,
  isValidNFTCAIP,
  isValidPushCAIP,
} from '../helpers';
import {
  IDENTITY_TYPE,
  DEFAULT_DOMAIN,
  NOTIFICATION_TYPE,
  SOURCE_TYPES,
  VIDEO_CALL_TYPE,
  VIDEO_NOTIFICATION_ACCESS_TYPE,
} from './constants';
import { ENV } from '../constants';
import { axiosPost } from '../utils/axiosUtil';
import { PushValidator } from '../pushValidator/pushValidator';
/**
 * Validate options for some scenarios
 */
function validateOptions(options: ISendNotificationInputOptions) {
  if (!options?.channel) {
    throw '[Push SDK] - Error - sendNotification() - "channel" is mandatory!';
  }
  if (!isValidPushCAIP(options.channel)) {
    throw '[Push SDK] - Error - sendNotification() - "channel" is invalid!';
  }
  if (options.senderType === 0 && options.signer === undefined) {
    throw '[Push SDK] - Error - sendNotification() - "signer" is mandatory!';
  }
  if (options.senderType === 1 && options.pgpPrivateKey === undefined) {
    throw '[Push SDK] - Error - sendNotification() - "pgpPrivateKey" is mandatory!';
  }

  /**
   * Apart from IPFS, GRAPH use cases "notification", "payload" is mandatory
   */
  if (
    options?.identityType === IDENTITY_TYPE.DIRECT_PAYLOAD ||
    options?.identityType === IDENTITY_TYPE.MINIMAL
  ) {
    if (!options.notification) {
      throw '[Push SDK] - Error - sendNotification() - "notification" mandatory for Identity Type: Direct Payload, Minimal!';
    }
    if (!options.payload) {
      throw '[Push SDK] - Error - sendNotification() - "payload" mandatory for Identity Type: Direct Payload, Minimal!';
    }
  }

  const isAdditionalMetaPayload = options.payload?.additionalMeta;

  const isVideoOrSpaceType =
    typeof options.payload?.additionalMeta === 'object' &&
    (options.payload.additionalMeta.type ===
      `${VIDEO_CALL_TYPE.PUSH_VIDEO}+1` ||
      options.payload.additionalMeta.type ===
        `${VIDEO_CALL_TYPE.PUSH_SPACE}+1`);

  if (
    isAdditionalMetaPayload &&
    isVideoOrSpaceType &&
    !options.chatId &&
    !options.rules
  ) {
    throw new Error(
      '[Push SDK] - Error - sendNotification() - Either chatId or rules object is required to send a additional meta notification for video or spaces'
    );
  }
}

/**
 *
 * @param payloadOptions channel, recipient and type tp verify whether it is a simulate type
 * @returns boolean
 */
async function checkSimulateNotification(payloadOptions: {
  channelFound: boolean;
  channelorAlias: string;
  recipient: string | string[] | undefined;
  type: NOTIFICATION_TYPE;
  env: ENV | undefined;
  senderType: 0 | 1;
}): Promise<boolean> {
  try {
    const { channelFound, channelorAlias, recipient, type, env, senderType } =
      payloadOptions || {};

    // Video call notifications are not simulated
    // If channel is found, then it is not a simulate type
    if (senderType === 1 || channelFound) return false;

    // if no channel info found, check if channel address = recipient and notification type is targeted
    const convertedRecipient =
      typeof recipient == 'string' && recipient?.split(':').length == 3
        ? recipient.split(':')[2]
        : recipient;
    return (
      channelorAlias == convertedRecipient &&
      type == NOTIFICATION_TYPE.TARGETTED
    );
  } catch (e) {
    return true;
  }
}

export async function sendNotification(options: ISendNotificationInputOptions) {
  try {
    const {
      /* 
        senderType = 0 for channel notification (default)
        senderType = 1 for chat notification
      */
      senderType = 0,
      signer,
      type,
      identityType,
      payload,
      recipients,
      channel,
      graph,
      ipfsHash,
      env = ENV.PROD,
      chatId,
      rules,
      pgpPrivateKey,
      channelFound = true,
    } = options || {};

    validateOptions(options);

    if (
      payload &&
      payload.additionalMeta &&
      typeof payload.additionalMeta === 'object' &&
      !payload.additionalMeta.domain
    ) {
      payload.additionalMeta.domain = DEFAULT_DOMAIN;
    }
    const _channelAddress = await getCAIPAddress(env, channel, 'Channel');
    const channelCAIPDetails = getCAIPDetails(_channelAddress);

    if (!channelCAIPDetails) throw Error('Invalid Channel CAIP!');

    const uuid = getUUID();
    const chainId = parseInt(channelCAIPDetails.networkId, 10);

    let COMMUNICATOR_CONTRACT = '';
    if (senderType === 0) {
      const { EPNS_COMMUNICATOR_CONTRACT } = getConfig(env, channelCAIPDetails);
      COMMUNICATOR_CONTRACT = EPNS_COMMUNICATOR_CONTRACT;
    }

    const _recipients = await getRecipients({
      env,
      notificationType: type,
      channel: _channelAddress,
      recipients,
      secretType: payload?.sectype,
    });

    const notificationPayload = getPayloadForAPIInput(options, _recipients);

    const verificationProof = await getVerificationProof({
      senderType,
      signer,
      chainId,
      identityType,
      notificationType: type,
      verifyingContract: COMMUNICATOR_CONTRACT,
      payload: notificationPayload,
      graph,
      ipfsHash,
      uuid,
      // for the pgpv2 verfication proof
      chatId:
        rules?.access.data.chatId ?? // for backwards compatibilty with 'chatId' param
        chatId,
      pgpPrivateKey,
    });

    const identity = getPayloadIdentity({
      identityType,
      payload: notificationPayload,
      notificationType: type,
      graph,
      ipfsHash,
    });

    const source = (await checkSimulateNotification({
      channelFound: channelFound,
      channelorAlias: options.channel,
      recipient: options.recipients,
      type: options.type,
      env: options.env,
      senderType: options.senderType as 0 | 1,
    }))
      ? SOURCE_TYPES.SIMULATE
      : getSource(chainId, identityType, senderType);

    const pushValidator = await PushValidator.initalize({ env });
    const token = await pushValidator.getToken();

    const apiPayload = {
      verificationProof,
      identity,
      sender:
        senderType === 1 && !isValidNFTCAIP(_channelAddress)
          ? `${channelCAIPDetails?.blockchain}:${channelCAIPDetails?.address}`
          : _channelAddress,
      source,
      validatorToken: token?.validatorToken,
      /** note this recipient key has a different expectation from the BE API, see the funciton for more */
      recipient: await getRecipientFieldForAPIPayload({
        env,
        notificationType: type,
        recipients: recipients || '',
        channel: _channelAddress,
      }),
      /* 
        - If 'rules' is not provided, check if 'chatId' is available.
        - If 'chatId' is available, create a new 'rules' object for backwards compatibility.
        - If neither 'rules' nor 'chatId' is available, do not include 'rules' in the payload.
      */
      ...(rules || chatId
        ? {
            rules: rules ?? {
              access: {
                data: { chatId },
                type: VIDEO_NOTIFICATION_ACCESS_TYPE.PUSH_CHAT,
              },
            },
          }
        : {}),
    };

    const requestURL = `${token?.validatorUrl}/apis/v1/messaging/addBlocking/`;
    return await axiosPost(requestURL, apiPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error(
      '[Push SDK] - Error - sendNotification() - ',
      JSON.stringify(err)
    );
    throw err;
  }
}
