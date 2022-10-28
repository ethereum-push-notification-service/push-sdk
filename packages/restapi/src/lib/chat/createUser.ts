import axios from 'axios';
import {
  getAPIBaseUrls,
} from '../helpers';
import Constants from '../constants';
import { Environment } from '../types';

/**
 *  POST '/v1/w2w/users
 */

export type ChatCreateUserOptionsType = {
  user: string;
  publicKey?: string;
  encryptedPrivateKey?: string;
  encryptionType?: string;
  signature?: string;
  sigType?: string;
  env?: Environment;
}

export const createUser = async (
  options: ChatCreateUserOptionsType
) => {
  const {
    user,
    publicKey = '',
    encryptedPrivateKey = '',
    encryptionType = '',
    signature = '',
    sigType = '',
    env = Constants.ENV.PROD,
  } = options || {};

  const API_BASE_URL = getAPIBaseUrls(env);
  const apiEndpoint = `${API_BASE_URL}/v1/w2w/users`;


  const requestUrl = `${apiEndpoint}`;

  const body = {
    caip10: user,
    did: user,
    publicKey,
    encryptedPrivateKey,
    encryptionType,
    signature,
    sigType,
  };

  return axios.post(requestUrl, body)
    .catch((err) => {
      console.error(`[EPNS-SDK] - API ${requestUrl}: `, err);
    });
}
