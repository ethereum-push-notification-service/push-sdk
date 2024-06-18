import {
  getCAIPAddress,
  getConfig,
  getCAIPDetails,
  Signer,
  getAPIBaseUrls,
} from '../helpers';
import {
  getDomainInformation,
  getTypeInformationV2,
  getSubscriptionMessageV2,
} from './signature.helpers';
import Constants, { ENV } from '../constants';
import { SignerType } from '../types';
import { axiosPost } from '../utils/axiosUtil';

export type SubscribeOptionsV2Type = {
  signer: SignerType;
  channelAddress: string;
  userAddress: string;
  settings?: string | null;
  verifyingContractAddress?: string;
  env?: ENV;
  origin?: string;
  onSuccess?: () => void;
  onError?: (err: Error) => void;
};

export const subscribeV2 = async (options: SubscribeOptionsV2Type) => {
  const {
    signer,
    channelAddress,
    userAddress,
    settings = undefined,
    verifyingContractAddress,
    env = Constants.ENV.PROD,
    origin,
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
    const typeInformation = getTypeInformationV2();

    // get message
    const messageInformation = {
      data: getSubscriptionMessageV2(
        channelCAIPDetails.address,
        userCAIPDetails.address,
        'Subscribe',
        settings
      ),
    };
    // sign a message using EIP712
    const pushSigner = new Signer(signer);
    const signature = await pushSigner.signTypedData(
      domainInformation,
      typeInformation,
      messageInformation,
      'Data'
    );

    const verificationProof = signature; // might change

    const body = {
      verificationProof: `eip712v2:${verificationProof}`,
      message: messageInformation.data,
      origin: origin,
    };

    const res = await axiosPost(requestUrl, body);

    if (typeof onSuccess === 'function') onSuccess();

    return { status: res.status, message: 'successfully opted into channel' };
  } catch (err: any) {
    if (typeof onError === 'function') onError(err as Error);

    return {
      status: err?.response?.status ?? '',
      message: err instanceof Error ? err.message : JSON.stringify(err),
    };
  }
};
