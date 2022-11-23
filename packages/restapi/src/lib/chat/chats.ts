import axios from 'axios';
import { getAPIBaseUrls, isValidETHAddress, walletToPCAIP10 } from '../helpers';
import Constants from '../constants';
import { Chat } from '../types';
import { Message } from './ipfs';
import { getInboxLists } from './helpers';

/**
 *  GET '/v1/chat/users/:did/chats
 */

export type ChatsOptionsType = {
  account: string;
  pgpPrivateKey?: string;
  toDecrypt?: boolean;
  env?: string;
};

// Only get the chats not the intent
export const chats = async (options: ChatsOptionsType): Promise<Message[]> => {
  const { account, pgpPrivateKey, env = Constants.ENV.PROD, toDecrypt = false } = options || {};
  const user = walletToPCAIP10(account);

  const API_BASE_URL = getAPIBaseUrls(env);
  const apiEndpoint = `${API_BASE_URL}/v1/chat/users/${user}/chats`;
  const requestUrl = `${apiEndpoint}`;
  try {
    if (!isValidETHAddress(user)) {
      throw new Error(`Invalid address!`);
    }
    const response = await axios.get(requestUrl);
    const chats: Chat[] = response.data.chats;
    const messages: Message[] = await getInboxLists({
      lists: chats,
      user,
      toDecrypt,
      pgpPrivateKey,
      env,
    });
    return messages;
  } catch (err) {
    console.error(`[EPNS-SDK] - API ${requestUrl}: `, err);
    throw Error(`[EPNS-SDK] - API ${requestUrl}: ${err}`);
  }
};