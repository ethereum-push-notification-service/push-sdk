import axios from 'axios';
import {
  getAPIBaseUrls,
} from '../helpers';
import Constants from '../constants';
import { Environment } from '../types';

/**
 *  PUT '/v1/w2w/intents
 */

export type ChatUpdateIntentOptionsType = {
  from: string;
  to: string;
  signature: string;
  status: string;
  sigType: string;
  env?: Environment;
}

export const updateIntent = async (
  options: ChatUpdateIntentOptionsType
) => {
  const {
    from,
    to,
    signature,
    status,
    sigType,
    env = Constants.ENV.PROD,
  } = options || {};

  const API_BASE_URL = getAPIBaseUrls(env);
  const apiEndpoint = `${API_BASE_URL}/v1/w2w/intents`;


  const requestUrl = `${apiEndpoint}`;

  const body = {
    fromDID: from,
    toDID: to,
    signature,
    status,
    sigType,
  };

  return axios.put(requestUrl, body)
    .catch((err) => {
      console.error(`[EPNS-SDK] - API ${requestUrl}: `, err);
    });
}
