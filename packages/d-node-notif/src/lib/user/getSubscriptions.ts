import { getCAIPAddress, getAPIBaseUrls, getQueryParams } from '../helpers';
import Constants, { ENV } from '../constants';
import { axiosGet } from '../utils/axiosUtil';
import { parseSubscriptionsApiResponse } from '../utils/pasreSubscriptionAPI';

export type UserSubscriptionsOptionsType = {
  user: string;
  env?: ENV;
  channel?: string | null;
  raw?: boolean;
};

export const getSubscriptions = async (
  options: UserSubscriptionsOptionsType
) => {
  const {
    user,
    env = Constants.ENV.PROD,
    channel = null,
    raw = true,
  } = options || {};

  const _user = await getCAIPAddress(env, user, 'User');
  const API_BASE_URL = await getAPIBaseUrls(env);
  const apiEndpoint = `${API_BASE_URL}/v1/users/${_user}/subscriptions`;
  const query = channel
    ? getQueryParams({
        channel: channel,
      })
    : '';
  const requestUrl = `${apiEndpoint}?${query}`;

  return axiosGet(requestUrl)
    .then((response) => {
      if (raw) {
        return response.data?.subscriptions || [];
      } else {
        return parseSubscriptionsApiResponse(
          response.data?.subscriptions || []
        );
      }
    })
    .catch((err) => {
      console.error(`[Push SDK] - API ${requestUrl}: `, err);
    });
};
