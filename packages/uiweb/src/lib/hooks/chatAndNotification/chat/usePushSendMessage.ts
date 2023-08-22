import * as PushAPI from '@pushprotocol/restapi';
import { Env, IFeeds } from '@pushprotocol/restapi';
import { useCallback, useContext, useState } from 'react';
import { Constants } from '../../../config';
import { ChatMainStateContext, ChatAndNotificationPropsContext } from '../../../context';
import type { ChatMainStateContextType } from '../../../context/chatAndNotification/chat/chatMainStateContext';
import useFetchChat from './useFetchChat';

interface SendMessageParams {
  message: string;
  receiver: string;

  messageType?: 'Text' | 'Image' | 'File' | 'GIF' | 'MediaEmbed';
}

const usePushSendMessage = () => {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const { setChatFeed, setChat, chatsFeed, chats, selectedChatId } =
    useContext<ChatMainStateContextType>(ChatMainStateContext);
  const { account, env, decryptedPgpPvtKey } =
    useContext<any>(ChatAndNotificationPropsContext);

  const { fetchChat } = useFetchChat();
  const sendMessage = useCallback(
    async (options: SendMessageParams) => {
      const { receiver, message, messageType } = options || {};
      setLoading(true);
      try {
        const response = await PushAPI.chat.send({
          messageContent: message,
          messageType: messageType,
          receiverAddress: receiver,
          account: account,
          pgpPrivateKey: decryptedPgpPvtKey,
          env: env,
        });
        setLoading(false);
        if (!response) {
          return false;
        }

        // const modifiedResponse = { ...response, messageContent: message };
        // if (chatsFeed[selectedChatId]) {
        //   const newOne: IFeeds = chatsFeed[selectedChatId];
        //   setChat(selectedChatId, {
        //     messages: Array.isArray(chats.get(selectedChatId)?.messages)
        //       ? [...chats.get(selectedChatId)!.messages, modifiedResponse]
        //       : [modifiedResponse],
        //     lastThreadHash:
        //       chats.get(selectedChatId)?.lastThreadHash ?? response.link,
        //   });

        //   newOne['msg'] = modifiedResponse;
        //   setChatFeed(selectedChatId, newOne);
        // } else {
        //   const fetchChatsMessages: IFeeds = (await fetchChat({
        //     recipientAddress: receiver,
        //   })) as IFeeds;
        //   setChatFeed(selectedChatId, fetchChatsMessages);
        //   setChat(selectedChatId, {
        //     messages: Array.isArray(chats.get(selectedChatId)?.messages)
        //       ? [...chats.get(selectedChatId)!.messages, modifiedResponse]
        //       : [modifiedResponse],
        //     lastThreadHash:
        //       chats.get(selectedChatId)?.lastThreadHash ?? response.link,
        //   });
        // }
        return;
      } catch (error: Error | any) {
        setLoading(false);
        setError(error.message);
        console.log(error);
        return;
      }
    },
    [decryptedPgpPvtKey, setChat, selectedChatId, chats]
  );

  return { sendMessage, error, loading };
};

export default usePushSendMessage;
