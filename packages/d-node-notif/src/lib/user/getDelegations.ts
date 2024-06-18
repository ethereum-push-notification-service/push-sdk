import { getCAIPAddress, getAPIBaseUrls } from '../helpers';
import Constants, { ENV } from '../constants';
import { axiosGet } from '../utils/axiosUtil';

/**
 *  GET /users/:userAddressInCAIP/delegations
 */

export type UserDelegationsOptionsType = {
  /** wallet address of user */
  user: string;
  env?: ENV;
};

/**
 *  Returns the list of channels that the user has been delegated to
 */

export const getDelegations = async (options: UserDelegationsOptionsType) => {
  const { user, env = Constants.ENV.PROD } = options || {};

  const _user = await getCAIPAddress(env, user, 'User');
  const API_BASE_URL = await getAPIBaseUrls(env);
  const apiEndpoint = `${API_BASE_URL}/v1/users/${_user}/delegations`;
  const requestUrl = `${apiEndpoint}`;

  return axiosGet(requestUrl)
    .then((response) => response.data?.delegations || [])
    .catch((err) => {
      console.error(`[EPNS-SDK] - API ${requestUrl}: `, err);
    });
};
