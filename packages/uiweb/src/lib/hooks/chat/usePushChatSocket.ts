import * as PushAPI from '@pushprotocol/restapi';
import { createSocketConnection, EVENTS } from '@pushprotocol/socket';
import { useCallback, useEffect, useState } from 'react';
import { ENV } from '../../config';

import { SOCKET_TYPE } from '../../types';
import useGetChatProfile from '../useGetChatProfile';
import { useChatData } from './useChatData';

export type PushChatSocketHookOptions = {
  account?: string | null;
  env?: ENV;
};

export const usePushChatSocket = () => {
  const {
    account,
    pgpPrivateKey,
    pushChatSocket,
    setPushChatSocket,
    setIsPushChatSocketConnected,
    isPushChatSocketConnected,
    connectedProfile,
    setConnectedProfile,
    env,
  } = useChatData();
const {fetchChatProfile} = useGetChatProfile();
  const [messagesSinceLastConnection, setMessagesSinceLastConnection] =
    useState<any>({});
    const [acceptedRequestMessage, setAcceptedRequestMessage] =
    useState<any>({});
  const [
    groupInformationSinceLastConnection,
    setGroupInformationSinceLastConnection,
  ] = useState<any>({});



  const addSocketEvents = useCallback(() => {
    console.log('addSocketEvents');
    pushChatSocket?.on(EVENTS.CONNECT, () => {
      setIsPushChatSocketConnected(true);
    });

    pushChatSocket?.on(EVENTS.DISCONNECT, (reason: string) => {
      setIsPushChatSocketConnected(false);
    });

    pushChatSocket?.on(EVENTS.CHAT_RECEIVED_MESSAGE, async (chat: any) => {
   
      if (!connectedProfile || !pgpPrivateKey) {
        return;
      }
      if (
      ( ( chat.messageCategory === 'Request') ||
       (chat.messageCategory === 'Approve') ||
       (chat.messageCategory === 'Reject') )&&
        (chat.messageContent === null) &&
        (chat.messageType === null)
      ) {
        setAcceptedRequestMessage(chat);
      }
      else
      {
        const response = await PushAPI.chat.decryptConversation({
          messages: [chat],
          connectedUser: connectedProfile,
          pgpPrivateKey: pgpPrivateKey,
          env: env,
        });

        if (response && response.length) {
          setMessagesSinceLastConnection(response[0]);
        }
      }
     
    });
    pushChatSocket?.on(EVENTS.CHAT_GROUPS, (groupInfo: any) => {
      /**
       * We receive a group creation or updated event.
       */
      setGroupInformationSinceLastConnection(groupInfo);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pushChatSocket,
    account,
    pgpPrivateKey,
    messagesSinceLastConnection,
    env,
    connectedProfile,
  ]);

  const removeSocketEvents = useCallback(() => {
    pushChatSocket?.off(EVENTS.CONNECT);
    pushChatSocket?.off(EVENTS.DISCONNECT);
    pushChatSocket?.off(EVENTS.CHAT_GROUPS);
    pushChatSocket?.off(EVENTS.CHAT_RECEIVED_MESSAGE);
  }, [pushChatSocket]);

  useEffect(() => {
    if (pushChatSocket) {
      addSocketEvents();
    }

    return () => {
      if (pushChatSocket) {
        removeSocketEvents();
      }
    };
  }, [pushChatSocket, pgpPrivateKey, connectedProfile]);

  /**
   * Whenever the required params to create a connection object change
   *  - disconnect the old connection
   *  - create a new connection object
   */
  useEffect(() => {
    if (account) {
      if (pushChatSocket && pushChatSocket.connected) {
        // pushChatSocket?.disconnect();
      } else {
        const main = async () => {
          const connectionObject = createSocketConnection({
            user: account,
            env,
            socketType: SOCKET_TYPE.CHAT,
            socketOptions: { autoConnect: true, reconnectionAttempts: 3 },
          });
          console.warn('new connection object: ', connectionObject);

          setPushChatSocket(connectionObject);
        };
        main().catch((err) => console.error(err));
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, env, pgpPrivateKey]);

  return {
    pushChatSocket,
    isPushChatSocketConnected,
    messagesSinceLastConnection,
    acceptedRequestMessage,
    groupInformationSinceLastConnection,
  };
};
