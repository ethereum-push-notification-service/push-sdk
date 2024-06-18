import {
  getCAIPAddress,
  getConfig,
  getCAIPDetails,
  Signer,
  getAPIBaseUrls,
} from '../helpers';
import {
  getTypeInformation,
  getDomainInformation,
  getSubscriptionMessage,
} from './signature.helpers';
import Constants, { ENV } from '../constants';
import { SignerType } from '../types';
import { axiosPost } from '../utils/axiosUtil';
export type SubscribeOptionsType = {
  signer: SignerType;
  channelAddress: string;
  userAddress: string;
  verifyingContractAddress?: string;
  origin?: string;
  env?: ENV;
  onSuccess?: () => void;
  onError?: (err: Error) => void;
};

export const subscribe = async (options: SubscribeOptionsType) => {
  const {
    signer,
    channelAddress,
    userAddress,
    verifyingContractAddress,
    origin,
    env = Constants.ENV.PROD,
    onSuccess,
    onError,
  } = options || {};

  try {
    const _channelAddress = await getCAIPAddress(
      env,
      channelAddress,
      'Channel'
    );

    const channelCAIPDetails = getCAIPDetails(_channelAddress);
    if (!channelCAIPDetails) throw Error('Invalid Channel CAIP!');

    const chainId = parseInt(channelCAIPDetails.networkId, 10);

    const _userAddress = await getCAIPAddress(env, userAddress, 'User');

    const userCAIPDetails = getCAIPDetails(_userAddress);
    if (!userCAIPDetails) throw Error('Invalid User CAIP!');

    const API_BASE_URL = await getAPIBaseUrls(env);
    const { EPNS_COMMUNICATOR_CONTRACT } = getConfig(env, channelCAIPDetails);

    const requestUrl = `${API_BASE_URL}/v1/channels/${_channelAddress}/subscribe`;

    // get domain information
    const domainInformation = getDomainInformation(
      chainId,
      verifyingContractAddress || EPNS_COMMUNICATOR_CONTRACT
    );

    // get type information
    const typeInformation = getTypeInformation('Subscribe');

    // get message
    const messageInformation = getSubscriptionMessage(
      channelCAIPDetails.address,
      userCAIPDetails.address,
      'Subscribe'
    );

    // sign a message using EIP712
    const pushSigner = new Signer(signer);
    const signature = await pushSigner.signTypedData(
      domainInformation,
      typeInformation as any,
      messageInformation,
      'Subscribe'
    );

    const verificationProof = signature; // might change

    const body = {
      verificationProof,
      message: {
        ...messageInformation,
        channel: _channelAddress,
        subscriber: _userAddress,
      },
      origin: origin,
    };

    await axiosPost(requestUrl, body);

    if (typeof onSuccess === 'function') onSuccess();

    return { status: 'success', message: 'successfully opted into channel' };
  } catch (err) {
    if (typeof onError === 'function') onError(err as Error);

    return {
      status: 'error',
      message: err instanceof Error ? err.message : JSON.stringify(err),
    };
  }
};
