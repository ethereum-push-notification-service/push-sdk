import axios from 'axios';
import {
  decryptWithWalletRPCMethod,
  getAPIBaseUrls,
  walletToPCAIP10,
} from '../helpers';
import Constants from '../constants';
import { getEncryptedRequest } from './helpers';
import { ChatOptionsType } from '../types';

/**
 *  POST /v1/chat/request
 */

export const start = async (options: Omit<ChatOptionsType, 'account'>) => {
  const {
    messageContent = '',
    messageType = 'Text',
    receiverAddress,
    connectedUser,
    env = Constants.ENV.PROD,
  } = options || {};

  const { message, encryptionType, aesEncryptedSecret, signature } =
    (await getEncryptedRequest(
      receiverAddress,
      connectedUser,
      messageContent,
      env
    )) || {};

  const API_BASE_URL = getAPIBaseUrls(env);
  const apiEndpoint = `${API_BASE_URL}/v1/chat/request`;
  const body = {
    fromDID: connectedUser.wallets.split(',')[0],
    toDID: walletToPCAIP10(receiverAddress),
    fromCAIP10: connectedUser.wallets.split(',')[0],
    toCAIP10: walletToPCAIP10(receiverAddress),
    messageContent: message,
    messageType,
    signature,
    encType: encryptionType,
    encryptedSecret: aesEncryptedSecret,
    sigType: signature,
  };

  return axios
    .post(apiEndpoint, body)
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      throw new Error(err);
    });
};
