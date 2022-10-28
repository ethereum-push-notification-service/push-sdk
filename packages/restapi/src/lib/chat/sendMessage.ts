import axios from 'axios';
import {
  getAPIBaseUrls,
} from '../helpers';
import Constants from '../constants';
import { Environment } from '../types';

/**
 *  POST '/v1/w2w/messages
 */

export type ChatSendMessageOptionsType = {
  from: string;
  to: string;
  messageType: string;
  messageContent: string;
  signature: string;
  encType: string;
  encryptedSecret: string;
  sigType: string;
  env?: Environment;
}

export const sendMessage = async (
  options: ChatSendMessageOptionsType
) => {
  const {
    from,
    to,
    messageType,
    messageContent,
    signature,
    encType,
    encryptedSecret,
    sigType,
    env = Constants.ENV.PROD,
  } = options || {};

  const API_BASE_URL = getAPIBaseUrls(env);
  const apiEndpoint = `${API_BASE_URL}/v1/w2w/messages`;


  const requestUrl = `${apiEndpoint}`;

  const body = {
    fromDID: from,
    toDID: to,
    fromCAIP10: from,
    toCAIP10: to,
    messageType,
    messageContent,
    signature,
    encType,
    encryptedSecret,
    sigType,
  };

  return axios.post(requestUrl, body)
    .catch((err) => {
      console.error(`[EPNS-SDK] - API ${requestUrl}: `, err);
    });
}
