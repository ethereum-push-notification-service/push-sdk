import { getCAIPAddress, getAPIBaseUrls, getQueryParams } from '../helpers';
import Constants, { ENV } from '../constants';
import { axiosGet } from '../utils/axiosUtil';
import { NotifictaionType } from '../types';

type GetChannelOptionsType = {
  channel: string;
  env?: ENV;
  page?: number;
  limit?: number;
  filter?: NotifictaionType | null;
  raw?: boolean;
};

export const getChannelNotifications = async (
  options: GetChannelOptionsType
) => {
  const {
    channel,
    env = Constants.ENV.PROD,
    page = Constants.PAGINATION.INITIAL_PAGE,
    limit = Constants.PAGINATION.LIMIT,
    filter = null,
    raw = true,
  } = options || {};

  const _channel = await getCAIPAddress(env, channel, 'Channel');
  const API_BASE_URL = await getAPIBaseUrls(env);
  const apiEndpoint = `${API_BASE_URL}/v2/channels`;
  const query = getQueryParams(
    filter
      ? {
          page,
          limit,
          notificationType: filter,
          raw,
        }
      : {
          page,
          limit,
          raw,
        }
  );
  const requestUrl = `${apiEndpoint}/${_channel}/notifications?${query}`;
  return await axiosGet(requestUrl).then((response) => {
    return response.data;
  });
};
