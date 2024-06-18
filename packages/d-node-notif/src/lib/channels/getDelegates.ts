import { getCAIPAddress, getAPIBaseUrls } from '../helpers';
import Constants, { ENV } from '../constants';
import { axiosGet } from '../utils/axiosUtil';

/**
 *  GET v1/channels/${channelAddressInCAIP}/delegates
 */

export type GetDelegatesOptionsType = {
  /** address of the channel */
  channel: string;
  env?: ENV;
};

/**
 *  Returns the list of addresses that the channel has delegated to
 */

export const getDelegates = async (options: GetDelegatesOptionsType) => {
  const { channel, env = Constants.ENV.PROD } = options || {};

  const _channel = await getCAIPAddress(env, channel, 'Channel');
  const API_BASE_URL = await getAPIBaseUrls(env);
  const apiEndpoint = `${API_BASE_URL}/v1/channels`;
  const requestUrl = `${apiEndpoint}/${_channel}/delegates`;

  return await axiosGet(requestUrl)
    .then((response) => response.data?.delegates)
    .catch((err) => {
      console.error(`[EPNS-SDK] - API ${requestUrl}: `, err);
    });
};
