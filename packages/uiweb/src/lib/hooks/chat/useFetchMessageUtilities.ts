
import * as PushAPI from '@pushprotocol/restapi';
import type { IMessageIPFS } from '@pushprotocol/restapi';
import { useCallback, useContext, useState } from 'react';
import { ChatDataContext } from '../../context';
import { useChatData } from './useChatData';




  interface HistoryMessagesParams {
    chatId: string;
    limit?: number;
    reference?:string| null;
  }
  interface FetchLatestMessageParams {
    chatId: string;
    
  }
  interface FetchChatListParams {
    type: keyof typeof PushAPI.ChatListType;
    overrideAccount?:string;
    page:number;
    limit:number;
    
  }
  

const useFetchMessageUtilities
 = () => {
  const [error, setError] = useState<string>();
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [latestLoading, setLatestLoading] = useState<boolean>(false);
  const [chatListLoading, setChatListLoading] = useState<boolean>(false);
  const { account, env,pgpPrivateKey ,user,signer} = useChatData();
  const fetchChatList = useCallback(async ({type,page,limit,overrideAccount = undefined}:FetchChatListParams) => {


    setChatListLoading(true);
    try {
      console.debug(user)
        const chats = await user?.chat
        .list(type, {
          overrideAccount: overrideAccount,
          page: page,
          limit: limit,
        })
        console.debug(chats,'chats from hook')
       return chats;
    } catch (error: Error | any) {
      setChatListLoading(false);
      setError(error.message);
      console.log(error);
      return;
    } finally {
      setChatListLoading(false);
    }
  }, [user,account,env,signer]);
  const fetchLatestMessage = useCallback(async ({chatId}:FetchLatestMessageParams) => {

    setLatestLoading(true);
    try {
        const latestChat:IMessageIPFS[] = await user?.chat.latest(chatId) as IMessageIPFS[];
       return latestChat;
    } catch (error: Error | any) {
      setLatestLoading(false);
      setError(error.message);
      console.log(error);
      return;
    } finally {
      setLatestLoading(false);
    }
  }, [user,account,env]);

  const historyMessages = useCallback(async ({chatId,reference=null,limit = 10,}:HistoryMessagesParams) => {

    setHistoryLoading(true);
    try {
        const chatHistory = await user?.chat.history(chatId,{limit,reference});

       return chatHistory;
    } catch (error: Error | any) {
      setHistoryLoading(false);
      setError(error.message);
      console.log(error);
      return;
    } finally {
      setHistoryLoading(false);
    }
  }, [pgpPrivateKey,account,env]);

  return { historyMessages, error, historyLoading ,latestLoading,fetchLatestMessage,fetchChatList,chatListLoading};
};

export default useFetchMessageUtilities;
