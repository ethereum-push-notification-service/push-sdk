
import * as PushAPI from '@pushprotocol/restapi';
import type { IMessageIPFS } from '@pushprotocol/restapi';
import { useCallback, useContext, useState } from 'react';
import { ChatDataContext } from '../../context';
import { useChatData } from './useChatData';




  interface HistoryMessagesParams {
    chatId?: string;
    limit?: number;
  }
  

const useFetchHistoryMessages
 = () => {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);

  const { account, env, alias } = useChatData();

  const historyMessages = useCallback(async ({chatId}: HistoryMessagesParams) => {

    setLoading(true);
    try {
        // const chatHistory:IMessageIPFS[] = await PushAPI.chat.history({
        //     threadhash: threadHash,
        //     account:account ? account : '0xeeE5A266D7cD954bE3Eb99062172E7071E664023',
        //     toDecrypt: pgpPrivateKey ? true : false,
        //     pgpPrivateKey: String(pgpPrivateKey),
        //     limit: limit,
        //     env: env
        //   });
        console.log(alias, "chatHistoryyy")
        const chatHistory = await alias.chat.history(chatId)
        console.log(chatHistory, "chatHistoryyy")
          chatHistory.reverse();
       return chatHistory;
    } catch (error: Error | any) {
      setLoading(false);
      setError(error.message);
      console.log(error);
      return;
    } finally {
      setLoading(false);
    }
  }, [account,env, alias]);

  return { historyMessages, error, loading };
};

export default useFetchHistoryMessages;