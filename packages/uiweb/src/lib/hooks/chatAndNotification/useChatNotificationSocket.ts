import type { IFeeds, IMessageIPFS } from '@pushprotocol/restapi';
import * as PushAPI from '@pushprotocol/restapi';
import { createSocketConnection, EVENTS } from '@pushprotocol/socket';
import { useCallback, useContext, useEffect, useState } from 'react';
import {
  ChatMainStateContext,
  ChatAndNotificationPropsContext,
  NotificationMainStateContext,
} from '../../context';
import type { ChatMainStateContextType } from '../../context/chatAndNotification/chat/chatMainStateContext';
import { ChatAndNotificationMainContext, ChatAndNotificationMainContextType } from '../../context/chatAndNotification/ChatAndNotificationMainContext';
import {
  checkIfIntent,
  getData,
  isPCAIP,
  pCAIP10ToWallet,
  setData,
} from '../../helpers';
import {
  convertAddressToAddrCaip,
  convertReponseToParsedArray,
} from '../../helpers/notification';
import type { ChatSocketType} from '../../types';
import { CHAT_SOCKET_TYPE } from '../../types';

import useFetchChat from '../chat/useFetchChat';

interface PushChatNotificationSocket {
  pushChatNotificationSocket: any;
  isSDKSocketConnected: boolean;
  messagesSinceLastConnection: any;
  groupInformationSinceLastConnection: any;
  notificationFeedSinceLastConnection: any; //add type
}

export type pushChatNotificationSocketType = {
  socketType?: ChatSocketType;
};

const getChatId = ({
  msg,
  account,
}: {
  msg: IMessageIPFS;
  account: string;
}) => {
  if (pCAIP10ToWallet(msg.fromDID).toLowerCase() === account.toLowerCase()) {
    return msg.toDID;
  }
  return !isPCAIP(msg.toDID) ? msg.toDID : msg.fromDID;
};

const useChatNotificationSocket = ({
  socketType = CHAT_SOCKET_TYPE.NOTIFICATION,
}: pushChatNotificationSocketType): PushChatNotificationSocket => {
  const [isSDKSocketConnected, setIsSDKSocketConnected] =
    useState<boolean>(false);
  const [messagesSinceLastConnection, setMessagesSinceLastConnection] =
    useState<any>('');
  const [
    groupInformationSinceLastConnection,
    setGroupInformationSinceLastConnection,
  ] = useState<any>('');
  const [
    notificationFeedSinceLastConnection,
    setNotificationFeedSinceLastConnection,
  ] = useState<any>('');
  const { fetchChat } = useFetchChat();
  const { account, env, decryptedPgpPvtKey, signer } = useContext<any>(
    ChatAndNotificationPropsContext
  );
  const {
    chats,
    setChat,
    chatsFeed,
    connectedProfile,
    setChatFeed,
    setRequestFeed,
    requestsFeed,
    selectedChatId,
  } = useContext<ChatMainStateContextType>(ChatMainStateContext);
  const { subscriptionStatus, setInboxNotifFeed, setSpamNotifFeed } =
    useContext<any>(NotificationMainStateContext);
  const {pushChatNotificationSocket,setPushChatNotificationSocket}=  useContext<ChatAndNotificationMainContextType>(ChatAndNotificationMainContext);
console.log(pushChatNotificationSocket)
  const addSocketEvents = useCallback(() => {
    console.log('add')
    pushChatNotificationSocket?.on(EVENTS.CONNECT, () => {
      setIsSDKSocketConnected(true);
    });

    pushChatNotificationSocket?.on(EVENTS.DISCONNECT, (err: any) => {
      console.log(err);
      setIsSDKSocketConnected(false);
    });

    pushChatNotificationSocket?.on(EVENTS.USER_FEEDS, (feedItem: any) => {
      const parseApiResponse = convertReponseToParsedArray([feedItem]);
      if (subscriptionStatus.get(parseApiResponse[0].channel))
        setInboxNotifFeed(parseApiResponse[0].sid, parseApiResponse[0]);
      else setSpamNotifFeed(parseApiResponse[0].sid, parseApiResponse[0]);

      setNotificationFeedSinceLastConnection(feedItem);
    });

    pushChatNotificationSocket?.on(EVENTS.CHAT_RECEIVED_MESSAGE, async (chat: any) => {
      console.log(chat)

      if (!connectedProfile || !decryptedPgpPvtKey) {
        return;
      }
console.log(chat)
      if (
        chat.messageCategory === 'Request' &&
        chat.messageContent === null &&
        chat.messageType === null &&
        chat.messageOrigin === 'self'
      )
        return;

      const response = await PushAPI.chat.decryptConversation({
        messages: [chat],
        connectedUser: connectedProfile,
        pgpPrivateKey: decryptedPgpPvtKey,
        env: env,
      });

      if (response && response.length) {
        console.log(response)
        const msg = response[0];
        const chatId = getChatId({ msg, account });
        console.log(chatId)
        console.log(chatsFeed)
        let newOne: IFeeds = {} as IFeeds;
        if (chatsFeed[chatId]) {
          newOne = chatsFeed[chatId];
console.log(msg)
          setChat(chatId, {
            messages: Array.isArray(chats.get(chatId)?.messages)
              ? [...chats.get(chatId)!.messages, msg]
              : [msg],
            lastThreadHash: chats.get(chatId)?.lastThreadHash ?? msg.link,
          });
          newOne['msg'] = msg;

          setChatFeed(chatId, newOne);
        } else if (requestsFeed[chatId]) {
          newOne = requestsFeed[chatId];
          setChat(chatId, {
            messages: Array.isArray(chats.get(chatId)?.messages)
              ? [...chats.get(chatId)!.messages, msg]
              : [msg],
            lastThreadHash: chats.get(chatId)?.lastThreadHash ?? msg.link,
          });

          newOne['msg'] = msg;
          setRequestFeed(chatId, newOne);
        } else {
          const fetchedChat: IFeeds = (await fetchChat({
            recipientAddress: chatId,
          })) as IFeeds;
          if (checkIfIntent({ chat: fetchedChat, account }))
            setRequestFeed(chatId, fetchedChat);
          else setChatFeed(chatId, fetchedChat);
          setChat(chatId, {
            messages: Array.isArray(chats.get(chatId)?.messages)
              ? [...chats.get(chatId)!.messages, msg]
              : [msg],
            lastThreadHash: chats.get(chatId)?.lastThreadHash ?? msg.link,
          });
        }
        if (selectedChatId === chatId) {
          setData({ chatId: chatId, value: newOne });
        }
      }
      setMessagesSinceLastConnection(chat);
    });

    pushChatNotificationSocket?.on(EVENTS.CHAT_GROUPS, (groupInfo: any) => {
      setGroupInformationSinceLastConnection(groupInfo);
    });
  }, [
    pushChatNotificationSocket,
    decryptedPgpPvtKey,
    chatsFeed,
    requestsFeed,
    setChat,
    chats,
    setChatFeed,
    setRequestFeed,
    fetchChat,
  ]);

  const removeSocketEvents = useCallback(() => {
    pushChatNotificationSocket?.off(EVENTS.CONNECT);
    pushChatNotificationSocket?.off(EVENTS.DISCONNECT);
    pushChatNotificationSocket?.off(EVENTS.CHAT_GROUPS);
    pushChatNotificationSocket?.off(EVENTS.CHAT_RECEIVED_MESSAGE);
  }, [pushChatNotificationSocket]);

  useEffect(() => {
    if (pushChatNotificationSocket) {
      addSocketEvents();
    }

    return () => {
      if (pushChatNotificationSocket) {
        removeSocketEvents();
      }
    };
  }, [addSocketEvents, pushChatNotificationSocket, removeSocketEvents]);

  /**
   * Whenever the required params to create a connection object change
   *  - disconnect the old connection
   *  - create a new connection object
   */
  useEffect(() => {
    if (decryptedPgpPvtKey) {
      if (pushChatNotificationSocket) {
        pushChatNotificationSocket?.disconnect();
      }
      let chainId = 1;
      (async () => {
        chainId = await signer.getChainId();
      })();
      // this is auto-connect on instantiation
      const connectionObject = createSocketConnection({
        user:
          socketType === CHAT_SOCKET_TYPE.CHAT
            ? account
            : convertAddressToAddrCaip(account, chainId),
        socketType,
        env: env,
      });
      setPushChatNotificationSocket(connectionObject);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decryptedPgpPvtKey, env]);

  return {
    pushChatNotificationSocket,
    isSDKSocketConnected,
    messagesSinceLastConnection,
    groupInformationSinceLastConnection,
    notificationFeedSinceLastConnection,
  };
};

export default useChatNotificationSocket;
