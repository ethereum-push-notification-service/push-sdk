import { getCAIPAddress, getAPIBaseUrls, getCAIPDetails } from '../helpers';
import Constants, { ENV } from '../constants';
import { axiosPost } from '../utils/axiosUtil';

export type GetSubscribersOptionsType = {
  channel: string; // plain ETH Format only
  env?: ENV;
};

/**
 * LEGACY SDK method, kept to support old functionality
 * can be removed if not needed in future.
 */

const deprecationWarning = `
 [Push SDK]: _getSubscribers() Deprecation Warning!
 This method has been deprecated, please use the below alternatives
 if you need to,
  * to check if user is subscribed or not: user.getSubscriptions()
  * get channels count: channels.getChannels()
`;

export const _getSubscribers = async (
  options: GetSubscribersOptionsType
): Promise<string[]> => {
  console.warn(deprecationWarning);

  const { channel, env = Constants.ENV.PROD } = options || {};

  const _channelAddress = await getCAIPAddress(env, channel, 'Channel');

  const channelCAIPDetails = getCAIPDetails(_channelAddress);
  if (!channelCAIPDetails) throw Error('Invalid Channel CAIP!');

  const chainId = channelCAIPDetails.networkId;

  const API_BASE_URL = await getAPIBaseUrls(env);
  const apiEndpoint = `${API_BASE_URL}/channels/_get_subscribers`;
  const requestUrl = `${apiEndpoint}`;

  const body = {
    channel: channelCAIPDetails.address, // deprecated API expects ETH address format
    blockchain: chainId,
    op: 'read',
  };

  const response = await axiosPost<{ subscribers: string[] }>(requestUrl, body);
  return response.data.subscribers;
};
