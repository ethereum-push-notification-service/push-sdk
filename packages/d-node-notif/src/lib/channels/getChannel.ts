import { getCAIPAddress, getAPIBaseUrls } from '../helpers';
import Constants, { ENV } from '../constants';
import { axiosGet } from '../utils/axiosUtil';
import { parseSettings } from '../utils/parseSettings';

/**
 *  GET /v1/channels/{addressinCAIP}
 */

export type GetChannelOptionsType = {
  channel: string;
  env?: ENV;
  raw?: boolean;
};

export const getChannel = async (options: GetChannelOptionsType) => {
  const { channel, env = Constants.ENV.PROD, raw = true } = options || {};

  const _channel = await getCAIPAddress(env, channel, 'Channel');
  const API_BASE_URL = await getAPIBaseUrls(env);
  const apiEndpoint = `${API_BASE_URL}/v1/channels`;
  const requestUrl = `${apiEndpoint}/${_channel}`;

  return await axiosGet(requestUrl).then((response) => {
    if (raw) return response.data;
    else {
      response.data.channel_settings = response.data.channel_settings
        ? parseSettings(response.data.channel_settings)
        : null;
      return response.data;
    }
  });
};
