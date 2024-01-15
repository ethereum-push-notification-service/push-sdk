import { ChatViewBubble } from "@pushprotocol/uiweb";
import { useEffect, useContext, useState } from "react";
import { EnvContext, Web3Context } from "../context";
import * as PUSHAPI from "@pushprotocol/restapi"
import { ENV } from "@pushprotocol/uiweb";
import { IMessagePayload } from "@pushprotocol/uiweb";

export const ChatViewBubbles = () => {
    const { env } = useContext<any>(EnvContext);

    const { library, account } = useContext<any>(Web3Context)
    const [message, setMessage] = useState<IMessagePayload[]>([])
    const [conversationHash, setConversationHash] = useState<string>('');

    const librarySigner = library.getSigner()

    const fetchMessage = async () => {
        const user = await PUSHAPI.user.get({
            account: account
        })
        const pgpPrivateKey = await PUSHAPI.chat.decryptPGPKey({
            encryptedPGPPrivateKey: user.encryptedPrivateKey,
            signer: librarySigner,
            env: env
        })

        const ConversationHash = await PUSHAPI.chat.conversationHash({
            account: `eip155:${account}`,
            conversationId: '196f58cbe07c7eb5716d939e0a3be1f15b22b2334d5179c601566600016860ac',
            env: env
        });
        setConversationHash(ConversationHash.threadHash);
        if (ConversationHash?.threadHash) {
            const chatHistory = await PUSHAPI.chat.history({
                threadhash: conversationHash,
                account: account,
                limit: 10,
                toDecrypt: true,
                pgpPrivateKey: pgpPrivateKey ? pgpPrivateKey : undefined,
                env: env
            })
            setMessage(chatHistory)
            console.log(chatHistory)
        }
    }

    useEffect(() => {
        fetchMessage()
    }, [])

    return (
        <div style={{ height: "350px", width: "500px" }}>
            {message.map((msg) => (
                <ChatViewBubble decryptedMessagePayload={msg} />
            ))}
        </div>
    )
}
