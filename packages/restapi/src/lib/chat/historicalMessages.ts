import Constants from '../constants';
import { pCAIP10ToWallet } from '../helpers';
import { AccountEnvOptionsType } from '../types';
import { get } from '../user';
import { decryptConversation, getMessagesService } from './helpers';

/**
 *  GET /v1/chat/conversationhash/:threadhash
 */

enum FetchLimit {
  MIN = 1,
  DEFAULT = 10,
  MAX = 30,
}

export interface HistoricalMessagesOptionsType extends AccountEnvOptionsType {
  threadhash: string;
  pgpPrivateKey?: string;
  toDecrypt?: boolean;
  limit?: number;
}

export const history = async (options: HistoricalMessagesOptionsType) => {
  const {
    threadhash,
    limit = FetchLimit.DEFAULT,
    pgpPrivateKey = '',
    account,
    toDecrypt = false,
    env = Constants.ENV.PROD,
  } = options || {};

  try {
    if (limit < FetchLimit.MIN || limit > FetchLimit.MAX) {
      if (limit < FetchLimit.MIN)
        throw new Error(`Limit must be more than equal to ${FetchLimit.MIN}`);
      else
        throw new Error(`Limit must be less than equal to ${FetchLimit.MAX}`);
    }

    const messages = await getMessagesService({ threadhash, limit, env });
    const connectedUser = await get({ account: pCAIP10ToWallet(account), env });
    return await decryptConversation({
      messages,
      connectedUser,
      toDecrypt,
      pgpPrivateKey,
      env,
    });
  } catch (err) {
    console.error(`[EPNS-SDK] - API fetchMessages -: `, err);
    throw Error(`[EPNS-SDK] - API fetchMessages -: ${err}`);
  }
};
