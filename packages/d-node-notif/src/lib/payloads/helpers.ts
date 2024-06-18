import { v4 as uuidv4 } from 'uuid';
import { ENV } from '../constants';
import { Signer, getCAIPAddress } from '../helpers';
import * as CryptoJS from 'crypto-js';

import {
  ISendNotificationInputOptions,
  INotificationPayload,
  walletType,
  VideoNotificationRules,
} from '../types';
import {
  IDENTITY_TYPE,
  NOTIFICATION_TYPE,
  CHAIN_ID_TO_SOURCE,
  SOURCE_TYPES,
  SUPPORTED_CHAINS,
} from './constants';
import { sign } from '../chat/helpers';

export function getUUID() {
  return uuidv4();
}

/**
 * This function will map the Input options passed to the SDK to the "payload" structure
 * needed by the API input
 *
 * We need notificationPayload only for identityType
 *  - DIRECT_PAYLOAD
 *  - MINIMAL
 */
export function getPayloadForAPIInput(
  inputOptions: ISendNotificationInputOptions,
  recipients: any
): INotificationPayload | null {
  if (inputOptions?.notification && inputOptions?.payload) {
    return {
      notification: {
        title: inputOptions?.notification?.title,
        body: inputOptions?.notification?.body,
      },
      data: {
        acta: inputOptions?.payload?.cta || '',
        aimg: inputOptions?.payload?.img || '',
        amsg: inputOptions?.payload?.body || '',
        asub: inputOptions?.payload?.title || '',
        type: inputOptions?.type?.toString() || '',
        //deprecated
        ...(inputOptions?.expiry && { etime: inputOptions?.expiry }),
        ...(inputOptions?.payload?.etime && {
          etime: inputOptions?.payload?.etime,
        }),
        //deprecated
        ...(inputOptions?.hidden && { hidden: inputOptions?.hidden }),
        ...(inputOptions?.payload?.hidden && {
          hidden: inputOptions?.payload?.hidden,
        }),
        ...(inputOptions?.payload?.silent && {
          silent: inputOptions?.payload?.silent,
        }),
        ...(inputOptions?.payload?.sectype && {
          sectype: inputOptions?.payload?.sectype,
        }),
        //deprecated
        ...(inputOptions?.payload?.metadata && {
          metadata: inputOptions?.payload?.metadata,
        }),
        ...(inputOptions?.payload?.additionalMeta && {
          additionalMeta: inputOptions?.payload?.additionalMeta,
        }),
        ...(inputOptions?.payload?.index && {
          index: inputOptions?.payload?.index,
        }),
      },
      recipients: recipients,
    };
  }

  return null;
}

/**
 * This function returns the recipient format accepted by the API for different notification types
 */
export async function getRecipients({
  env,
  notificationType,
  channel,
  recipients,
  secretType,
}: {
  env: ENV;
  notificationType: NOTIFICATION_TYPE;
  channel: string;
  recipients?: string | string[];
  secretType?: string;
}) {
  let addressInCAIP = '';

  if (secretType) {
    let secret = '';
    // return '';
    /**
     * Currently SECRET FLOW is yet to be finalized on the backend, so will revisit this later.
     * But in secret flow we basically generate secret for the address
     * and send it in { 0xtarget: secret_generated_for_0xtarget } format for all
     */
    if (notificationType === NOTIFICATION_TYPE.TARGETTED) {
      if (typeof recipients === 'string') {
        addressInCAIP = await getCAIPAddress(env, recipients, 'Recipient');
        secret = ''; // do secret stuff // TODO

        return {
          [addressInCAIP]: secret,
        };
      }
    } else if (notificationType === NOTIFICATION_TYPE.SUBSET) {
      if (Array.isArray(recipients)) {
        const recipientObject = recipients.reduce(
          async (_recipients, _rAddress) => {
            addressInCAIP = await getCAIPAddress(env, _rAddress, 'Recipient');
            secret = ''; // do secret stuff // TODO

            return {
              ..._recipients,
              [addressInCAIP]: secret,
            };
          },
          {}
        );

        return recipientObject;
      }
    }
  } else {
    /**
     * NON-SECRET FLOW
     */

    if (notificationType === NOTIFICATION_TYPE.BROADCAST) {
      return await getCAIPAddress(env, channel, 'Recipient');
    } else if (notificationType === NOTIFICATION_TYPE.TARGETTED) {
      if (typeof recipients === 'string') {
        return await getCAIPAddress(env, recipients, 'Recipient');
      }
    } else if (notificationType === NOTIFICATION_TYPE.SUBSET) {
      if (Array.isArray(recipients)) {
        if (Array.isArray(recipients)) {
          const recipientObject: any = {};
          recipients.map(async (_rAddress: string) => {
            addressInCAIP = await getCAIPAddress(env, _rAddress, 'Recipient');
            recipientObject[addressInCAIP] = null;
          });
          return recipientObject;
        }
      }
    }
  }
  return recipients;
}

export async function getRecipientFieldForAPIPayload({
  env,
  notificationType,
  recipients,
  channel,
}: {
  env: ENV;
  notificationType: NOTIFICATION_TYPE;
  recipients: string | string[];
  channel: string;
}) {
  if (
    notificationType === NOTIFICATION_TYPE.TARGETTED &&
    typeof recipients === 'string'
  ) {
    return await getCAIPAddress(env, recipients, 'Recipient');
  }

  return await getCAIPAddress(env, channel, 'Recipient');
}

export async function getVerificationProof({
  senderType,
  signer,
  chainId,
  notificationType,
  identityType,
  verifyingContract,
  payload,
  ipfsHash,
  graph = {},
  uuid,
  chatId,
  wallet,
  pgpPrivateKey,
  env,
  rules,
}: {
  senderType: 0 | 1;
  signer: any;
  chainId: number;
  notificationType: NOTIFICATION_TYPE;
  identityType: IDENTITY_TYPE;
  verifyingContract: string;
  payload: any;
  ipfsHash?: string;
  graph?: any;
  uuid: string;
  // for notifications which have additionalMeta in payload
  chatId?: string;
  wallet?: walletType;
  pgpPrivateKey?: string;
  env?: ENV;
  rules?: VideoNotificationRules;
}) {
  let message = null;
  let verificationProof = null;

  switch (identityType) {
    case IDENTITY_TYPE.MINIMAL: {
      message = {
        data: `${identityType}+${notificationType}+${payload.notification.title}+${payload.notification.body}`,
      };
      break;
    }
    case IDENTITY_TYPE.IPFS: {
      message = {
        data: `1+${ipfsHash}`,
      };
      break;
    }
    case IDENTITY_TYPE.DIRECT_PAYLOAD: {
      const payloadJSON = JSON.stringify(payload);
      message = {
        data: `2+${payloadJSON}`,
      };
      break;
    }
    case IDENTITY_TYPE.SUBGRAPH: {
      message = {
        data: `3+graph:${graph?.id}+${graph?.counter}`,
      };
      break;
    }
    default: {
      throw new Error('Invalid IdentityType');
    }
  }

  switch (senderType) {
    case 0: {
      const type = {
        Data: [{ name: 'data', type: 'string' }],
      };
      const domain = {
        name: 'EPNS COMM V1',
        chainId: chainId,
        verifyingContract: verifyingContract,
      };
      const pushSigner = new Signer(signer);
      const signature = await pushSigner.signTypedData(
        domain,
        type,
        message,
        'Data'
      );
      verificationProof = `eip712v2:${signature}::uid::${uuid}`;
      break;
    }
    case 1: {
      const hash = CryptoJS.SHA256(JSON.stringify(message)).toString();
      const signature = await sign({
        message: hash,
        signingKey: pgpPrivateKey!,
      });
      verificationProof = `pgpv2:${signature}:meta:${chatId}::uid::${uuid}`;
      break;
    }
    default: {
      throw new Error('Invalid SenderType');
    }
  }
  return verificationProof;
}

export function getPayloadIdentity({
  identityType,
  payload,
  notificationType,
  ipfsHash,
  graph = {},
}: {
  identityType: IDENTITY_TYPE;
  payload: any;
  notificationType?: NOTIFICATION_TYPE;
  ipfsHash?: string;
  graph?: any;
}) {
  if (identityType === IDENTITY_TYPE.MINIMAL) {
    return `0+${notificationType}+${payload.notification.title}+${payload.notification.body}`;
  } else if (identityType === IDENTITY_TYPE.IPFS) {
    return `1+${ipfsHash}`;
  } else if (identityType === IDENTITY_TYPE.DIRECT_PAYLOAD) {
    const payloadJSON = JSON.stringify(payload);
    return `2+${payloadJSON}`;
  } else if (identityType === IDENTITY_TYPE.SUBGRAPH) {
    return `3+graph:${graph?.id}+${graph?.counter}`;
  }

  return null;
}

export function getSource(
  chainId: number,
  identityType: IDENTITY_TYPE,
  senderType: 0 | 1
) {
  if (senderType === 1) {
    return SOURCE_TYPES.PUSH_VIDEO;
  }
  if (identityType === IDENTITY_TYPE.SUBGRAPH) {
    return SOURCE_TYPES.THE_GRAPH;
  }
  return CHAIN_ID_TO_SOURCE[chainId];
}

export function getCAIPFormat(chainId: number, address: string) {
  // EVM based chains
  if (SUPPORTED_CHAINS.includes(chainId)) {
    return `eip155:${chainId}:${address}`;
  }

  return address;
  // TODO: add support for other non-EVM based chains
}
