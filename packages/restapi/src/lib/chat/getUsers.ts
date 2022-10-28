import axios from 'axios';
import {
  getAPIBaseUrls,
} from '../helpers';
import Constants from '../constants';
import { Environment } from '../types';

/**
 *  GET '/v1/w2w/users
 */

export type ChatUsersOptionsType = {
  env?: Environment;
}

export const getUsers = async (
  options: ChatUsersOptionsType
) => {
  const {
    env = Constants.ENV.PROD,
  } = options || {};

  const API_BASE_URL = getAPIBaseUrls(env);
  const apiEndpoint = `${API_BASE_URL}/v1/w2w/users`;


  const requestUrl = `${apiEndpoint}`;

  return axios.get(requestUrl)
    .catch((err) => {
      console.error(`[EPNS-SDK] - API ${requestUrl}: `, err);
    });
}
