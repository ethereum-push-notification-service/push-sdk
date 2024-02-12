import {
  getCAIPAddress,
  getAPIBaseUrls,
  getQueryParams,
  getLimit,
} from '../helpers';
import Constants, {ENV} from '../constants';
import { parseApiResponse } from '../utils';
import { axiosGet } from '../utils/axiosUtil';
import { decryptFeed } from '../utils/decryptFeed';

export type FeedsOptionsType = {
  user: string;
  env?: ENV;
  page?: number;
  limit?: number;
  spam?: boolean;
  raw?: boolean;
  lit?: any;
  pgpPrivateKey?: any;
}

export const getFeeds = async (
  options: FeedsOptionsType
) => {
  const {
    user,
    env = Constants.ENV.PROD,
    page = Constants.PAGINATION.INITIAL_PAGE,
    limit = Constants.PAGINATION.LIMIT,
    spam = false,
    raw = false,
    lit = null,
    pgpPrivateKey = null
  } = options || {};

  const _user = await getCAIPAddress(env, user, 'User');
  const API_BASE_URL = getAPIBaseUrls(env);
  const apiEndpoint = `${API_BASE_URL}/v1/users/${_user}/feeds`;

  const queryObj = {
    page,
    limit: getLimit(limit),
    spam
  };

  const requestUrl = `${apiEndpoint}?${getQueryParams(queryObj)}`;
  return axiosGet(requestUrl)
    .then((response) => {
      if (raw) {
        return response?.data?.feeds.map((feed: any)=> {
          if(feed.payload.data.secret != null || feed.payload.data.secret != '')
            return feed;
          else {
            return decryptFeed({feed, pgpPrivateKey: pgpPrivateKey, lit: lit})
          }
        }) || [];
      }
      return parseApiResponse(response?.data?.feeds, pgpPrivateKey, lit) || [];
    })
    .catch((err) => {
      console.error(`[Push SDK] - API ${requestUrl}: `, err);
    });
}
