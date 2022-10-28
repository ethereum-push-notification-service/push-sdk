import axios from 'axios';
import {
  getAPIBaseUrls,
} from '../helpers';
import Constants from '../constants';
import { Environment } from '../types';

/**
 *  PUT '/v1/w2w/users/:did
 */

export type ChatUpdateUserOptionsType = {
  user: string;
  profilePictureCID?: string;
  name?: string;
  env?: Environment;
}

export const updateUser = async (
  options: ChatUpdateUserOptionsType
) => {
  const {
    user,
    profilePictureCID = '',
    name = '',
    env = Constants.ENV.PROD,
  } = options || {};

  const API_BASE_URL = getAPIBaseUrls(env);
  const apiEndpoint = `${API_BASE_URL}/v1/w2w/users/${user}`;


  const requestUrl = `${apiEndpoint}`;

  const body = {
    caip10: user,
    profilePictureCID,
    name,
  };

  return axios.put(requestUrl, body)
    .catch((err) => {
      console.error(`[EPNS-SDK] - API ${requestUrl}: `, err);
    });
}
