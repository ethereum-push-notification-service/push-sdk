import Constants from '../constants';
import { handleError } from '../errors/validationError';
import { convertToValidDID, isValidPushCAIP } from '../helpers';
import { ConversationHashOptionsType } from '../types';
import { getConversationHashService } from './helpers';

/**
 * All chat messages are stored on IPFS. This function will return the latest message's CID (Content Identifier on IPFS).
 * Whenever a new message is sent or received, this CID will change.
 */

export const conversationHash = async (
  options: ConversationHashOptionsType
) => {
  const { conversationId, account, env = Constants.ENV.PROD } = options || {};
  try {
    if (!isValidPushCAIP(account)) {
      throw new Error(`Invalid address!`);
    }

    const updatedConversationId = await convertToValidDID(conversationId, env);
    const accountDID = await convertToValidDID(account, env);
    const response = await getConversationHashService({
      conversationId: updatedConversationId,
      account: accountDID,
      env,
    });
    return response;
  } catch (err) {
    throw handleError(err, conversationHash.name);
  }
};
