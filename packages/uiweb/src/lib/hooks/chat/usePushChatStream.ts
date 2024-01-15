/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from 'react';
import { CONSTANTS, PushAPI, SignerType } from '@pushprotocol/restapi';
import { ENV } from '../../config';
import { useChatData } from './useChatData';


export const usePushChatStream = () => {

    const {
        account,
        pushChatStream,
        setPushChatStream,
        setIsPushChatStreamConnected,
        env,
        pushUser

    } = useChatData();


    const [chatStream, setChatStream] = useState<any>({}) // to track any new messages
    const [chatRequestStream, setChatRequestStream] = useState<any>({}); // any message in request
    const [groupMetaStream, setGroupMetaStream] = useState<any>({}); //group info

    const addSocketEvents = async () => {
        console.warn('\n--> addChatSocketEvents - stream');
        pushChatStream?.on(CONSTANTS.STREAM.CONNECT, (err: Error) => {
            console.log('CONNECTED - stream: ', err);
            setIsPushChatStreamConnected(true);
        });
      
        pushChatStream?.on(CONSTANTS.STREAM.DISCONNECT, (err: Error) => {
            console.log('DIS-CONNECTED: - stream ', err);
            setIsPushChatStreamConnected(false);
        });


        //Listen for chat messages, your message, request, accept, rejected,
        pushChatStream?.on(CONSTANTS.STREAM.CHAT, (message: any) => {
            if ((message.event === "chat.request")) {
                setChatRequestStream(message);
            } else {
                setChatStream(message);
            }

        });
        pushChatStream?.on(CONSTANTS.STREAM.CHAT_OPS, (chatops: any) => {
            setGroupMetaStream(chatops)
        });

    };



    const removeSocketEvents = () => {
        pushChatStream?.disconnect();
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (pushChatStream) {
            addSocketEvents();
        }

        return () => {
            if (pushChatStream) {
                removeSocketEvents();
            }
        }
    }, [pushChatStream]);

   
    /**
     * Whenever the requisite params to create a connection object change
     *  - disconnect the old connection 
     *  - create a new connection object
     */

    useEffect(() => {
        if (pushUser) {
            if(pushChatStream){
                pushChatStream?.disconnect();
            }
            else {
                console.log(pushChatStream)
                const main = async () => {
                    const newstream = await pushUser?.initStream(
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
                            raw: true   
                        }
                    );
                    console.log('new connection object: ---- ', newstream);
                    await newstream?.connect();
                    setPushChatStream(newstream);

                };
                main().catch((err) =>
                    console.log("error initializing the stream", err)
                );
            }


        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account, env,pushUser]);

    
   
    return {
        chatStream,
        groupMetaStream,
        chatRequestStream,
    }
};