import {
  getCAIPAddress,
  getAPIBaseUrls,
  getQueryParams,
  getLimit,
} from '../helpers';
import Constants, { ENV } from '../constants';
import { parseApiResponse } from '../utils';
import { axiosGet } from '../utils/axiosUtil';

export type FeedsPerChannelOptionsType = {
  user: string;
  env?: ENV;
  channels?: string[];
  page?: number;
  limit?: number;
  spam?: boolean;
  raw?: boolean;
};

export const getFeedsPerChannel = async (
  options: FeedsPerChannelOptionsType
) => {
  const {
    user,
    env = Constants.ENV.PROD,
    page = Constants.PAGINATION.INITIAL_PAGE,
    limit = Constants.PAGINATION.LIMIT,
    spam = false,
    raw = false,
    channels = [],
  } = options || {};

  const _user = await getCAIPAddress(env, user, 'User');
  const API_BASE_URL = await getAPIBaseUrls(env);
  if (channels.length == 0) {
    throw new Error('channels cannot be empty');
  }
  const _channel = await getCAIPAddress(env, channels[0], 'Channel');
  const apiEndpoint = `${API_BASE_URL}/v1/users/${_user}/channels/${_channel}/feeds`;
  const queryObj = {
    page,
    limit: getLimit(limit),
    spam,
  };

  const requestUrl = `${apiEndpoint}?${getQueryParams(queryObj)}`;
  return axiosGet(requestUrl)
    .then((response) => {
      if (raw) {
        return response?.data?.feeds || [];
      }
      return parseApiResponse(response?.data?.feeds) || [];
    })
    .catch((err) => {
      console.error(`[Push SDK] - API ${requestUrl}: `, err);
    });
};
