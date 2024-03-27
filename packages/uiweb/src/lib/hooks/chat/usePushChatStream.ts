/* eslint-disable react-hooks/rules-of-hooks */
import { CONSTANTS, PushAPI, SignerType } from '@pushprotocol/restapi';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ENV } from '../../config';
import { useChatData } from './useChatData';

export const usePushChatStream = () => {
  const {
    account,
    pushChatStream,
    setPushChatStream,
    setIsPushChatStreamConnected,
    env,
    user,
  } = useChatData();

  const [chatStream, setChatStream] = useState<any>({}); // to track any new messages
  const [chatAcceptStream, setChatAcceptStream] = useState<any>({}); // to track any new messages
  const [chatRejectStream, setChatRejectStream] = useState<any>({}); // to track any rejected request

  const [chatRequestStream, setChatRequestStream] = useState<any>({}); // any message in request
  const [participantRoleChangeStream, setParticipantRoleChangeStream] = useState<any>({}); // to track if a participant role is changed in a  group

  const [participantRemoveStream, setParticipantRemoveStream] = useState<any>({}); // to track if a participant is removed from group
  const [participantLeaveStream, setParticipantLeaveStream] = useState<any>({}); // to track if a participant leaves a group
  const [participantJoinStream, setParticipantJoinStream] = useState<any>({}); // to track if a participant joins a group
  const [groupCreateStream, setGroupCreateStream] = useState<any>({}); // to track if group is created

  const [groupUpdateStream, setGroupUpdateStream] = useState<any>({}); //group updation stream



  const attachListenersAndConnect = async (stream: any) => {
    stream?.on(CONSTANTS.STREAM.CONNECT, (err: Error) => {
        console.debug(' stream connected .........',err)
      setIsPushChatStreamConnected(true);
    });

    stream?.on(CONSTANTS.STREAM.DISCONNECT, (err: Error) => {
        console.debug(err)
      setIsPushChatStreamConnected(false);
    });

    //Listen for chat messages, your message, request, accept, rejected,
    stream?.on(CONSTANTS.STREAM.CHAT, (message: any) => {
   

      if (message.event === 'chat.request') {
        dispatchEvent(new CustomEvent("chatRequestStream", {detail:message}));
        setChatRequestStream(message);
      } else if (message.event === 'chat.accept') {
        dispatchEvent(new CustomEvent("chatAcceptStream", {detail:message}));
        setChatAcceptStream(message);
      } else if (message.event === 'chat.reject') {
        dispatchEvent(new CustomEvent("chatRejectStream", {detail:message}));
        setChatRejectStream(message);
      }
      else if (message.event === 'chat.group.participant.remove') {
        dispatchEvent(new CustomEvent("participantRemoveStream", {detail:message}));
        setParticipantRemoveStream(message);
      }
      else if (message.event === 'chat.group.participant.leave') {
        dispatchEvent(new CustomEvent("participantLeaveStream", {detail:message}));
        setParticipantLeaveStream(message);
      }
      else if (message.event === 'chat.group.participant.join') {
        dispatchEvent(new CustomEvent("participantJoinStream", {detail:message}));
        setParticipantJoinStream(message);
      }
      else if (message.event === 'chat.group.participant.role'){
        dispatchEvent(new CustomEvent("participantRoleChangeStream", {detail:message}));
        setParticipantRoleChangeStream(message);
      }
   
       else if (message.event === 'chat.message') {
        dispatchEvent(new CustomEvent("chatStream", {detail:message}));
        setChatStream(message);
      }
    });

    // Listen for group info
    stream?.on(CONSTANTS.STREAM.CHAT_OPS, (chatops: any) => {
         if (chatops.event === 'chat.group.update') {
          dispatchEvent(new CustomEvent("groupUpdateStream", {detail:chatops}));
          setGroupUpdateStream(chatops);
        }
        else if (chatops.event === 'chat.group.create') {
          dispatchEvent(new CustomEvent("groupCreateStream", {detail:chatops}));
          setGroupCreateStream(chatops);
        }
        
    });

    console.debug('stream listeners attached');
  };

//   useEffect(()=>{

// // return () => {
// //   setChatStream({});
// // };
//   },[chatStream])

  // useEffect(()=>{
  //   console.debug('resetting chatStream')
    
  //   return () => {
  //     setChatStream(null);
  //   };
  //     },[])

  /**
   * Whenever the requisite params to create a connection object change
   *  - disconnect the old connection
   *  - create a new connection object
   */
  useEffect(() => {

    if (!user) {
      return;
    }

    const initUser = async () => {
      // create a new connection object
      if (!user.stream) {
        const stream = await user?.initStream(
          [
            CONSTANTS.STREAM.CHAT,
            CONSTANTS.STREAM.CHAT_OPS,
            CONSTANTS.STREAM.CONNECT,
            CONSTANTS.STREAM.DISCONNECT,
          ],
          {
            connection: {
              retries: 3, // number of retries in case of error
            },
            raw: true,
          }
        );
        console.debug(stream)

        // attach listeneres
        await attachListenersAndConnect(stream);
      }

      // establish a new connection
      if (!user.stream.connected()) {
        await user.stream?.connect();
        console.debug('Connect stream: ', user);
      }
    };

    initUser();

    // Return a function to clean up the effect
    return () => {
      if (user && user.stream) {
        user.stream?.disconnect();
        console.debug('Disconnect stream: ', user);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, env, account]);
  return {
    chatStream,
    chatRequestStream,
    chatAcceptStream,
    groupUpdateStream,
    chatRejectStream,
    participantRemoveStream,
    participantLeaveStream,
    participantJoinStream,
    participantRoleChangeStream,
    groupCreateStream
  };
};