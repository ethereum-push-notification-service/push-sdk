import React, { useContext, useEffect, useRef, useState } from 'react';

import {
  GroupDTO,
  IFeeds,
  IMessageIPFS,
  IMessageIPFSWithCID,
} from '@pushprotocol/restapi';
import styled from 'styled-components';

import { IChatViewListProps } from '../exportedTypes';
import useFetchHistoryMessages from '../../../hooks/chat/useFetchHistoryMessages';
import { Section, Span, Spinner } from '../../reusables';
import { ChatViewBubble } from '../ChatViewBubble';
import { ENCRYPTION_KEYS, EncryptionMessage } from './MessageEncryption';
import useChatProfile from '../../../hooks/chat/useChatProfile';
import useFetchChat from '../../../hooks/chat/useFetchChat';
import useGetGroupByID from '../../../hooks/chat/useGetGroupByID';
import { ApproveRequestBubble } from './ApproveRequestBubble';

import { formatTime } from '../../../helpers/timestamp';
import { chatLimit } from '../../../config';
import {
  appendUniqueMessages,
  checkIfIntent,
  checkIfSameChat,
  getDefaultFeedObject,
  getNewChatUser,
  pCAIP10ToWallet,
  walletToPCAIP10,
} from '../../../helpers';
import { useChatData, usePushChatStream } from '../../../hooks';
import { Messagetype } from '../../../types';
import { ThemeContext } from '../theme/ThemeProvider';
import { IChatTheme } from '../theme';


/**
 * @interface IThemeProps
 * this interface is used for defining the props for styled components
 */
interface IThemeProps {
  theme?: IChatTheme;
  blur: boolean;
}
const ChatStatus = {
  FIRST_CHAT: `This is your first conversation with recipient.\n Start the conversation by sending a message.`,
  INVALID_CHAT: 'Invalid chatId',
};

export const ChatViewList: React.FC<IChatViewListProps> = (
  options: IChatViewListProps
) => {
  const { chatId, limit = chatLimit, chatFilterList = [] } = options || {};
  const { account, pushUser } =
    useChatData();
  const [chatFeed, setChatFeed] = useState<IFeeds>({} as IFeeds);
  const [chatStatusText, setChatStatusText] = useState<string>('');
  const [messages, setMessages] = useState<Messagetype>();
  const [loading, setLoading] = useState<boolean>(true);
  const [conversationHash, setConversationHash] = useState<string>();
  const { historyMessages, loading: messageLoading } =
    useFetchHistoryMessages();
  const listInnerRef = useRef<HTMLDivElement>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const { fetchChat } = useFetchChat();
  const { fetchChatProfile } = useChatProfile();
  const { getGroupByID } = useGetGroupByID();

  // const { messagesSinceLastConnection, groupInformationSinceLastConnection } =
  //   usePushChatSocket();
  const { chatRequestStream, groupMetaStream } =
    usePushChatStream();
  const theme = useContext(ThemeContext);
  const dates = new Set();
  const { env } = useChatData();

  useEffect(() => {
    setChatStatusText('');
  }, [chatId, account, env]);

  useEffect(() => {
    setMessages(undefined);
    setConversationHash(undefined);
  }, [chatId, account, env]);
  //need to make a common method for fetching chatFeed to ruse in messageInput
  useEffect(() => {
    (async () => {
      if (Object.keys(pushUser || {}).length) {
        const chat = await fetchChat({chatId});
        if (chat) {
          setConversationHash(chat?.threadhash as string);
          setChatFeed(chat as IFeeds);
        } else {
          let newChatFeed;
          let group;
          const result = await getNewChatUser({
            searchText: chatId,
            fetchChatProfile,
            env,
          });
          if (result) {
            newChatFeed = getDefaultFeedObject({ user: result });
          } else {
            group = await getGroupByID({groupId:chatId});
            if (group) {
              newChatFeed = getDefaultFeedObject({ groupInformation: group });
            }
          }
          if (newChatFeed) {
            if (!newChatFeed?.groupInformation) {
              setChatStatusText(ChatStatus.FIRST_CHAT);
            }
            setConversationHash(newChatFeed.threadhash as string);
            setChatFeed(newChatFeed);
          } else {
            setChatStatusText(ChatStatus.INVALID_CHAT);
          }
        }
        setLoading(false);
      }
    })();
  }, [chatId, account, env, pushUser]);

  // //moniters socket changes
  // useEffect(() => {
  //   if (checkIfSameChat(messagesSinceLastConnection, account!, chatId.includes(":") ? chatId.split(":")[1] : chatId)) {
  //     const updatedChatFeed = chatFeed;
  //     updatedChatFeed.msg = messagesSinceLastConnection;
  //     if (!Object.keys(messages || {}).length) {

  //       setFilteredMessages([
  //         messagesSinceLastConnection,
  //       ] as IMessageIPFSWithCID[]);
  //       setConversationHash(messagesSinceLastConnection.cid);
  //     } else {
  //       const newChatViewList = appendUniqueMessages(
  //         messages as Messagetype,
  //         [messagesSinceLastConnection],
  //         false
  //       );
  //       setFilteredMessages(newChatViewList as IMessageIPFSWithCID[]);
  //     }
  //     setChatStatusText('');
  //     setChatFeed(updatedChatFeed);
  //     scrollToBottom();
  //   }
  // }, [messagesSinceLastConnection]);

  // useEffect(() => {
  //   if (Object.keys(groupInformationSinceLastConnection || {}).length) {
  //     if (
  //       chatFeed?.groupInformation?.chatId.toLowerCase() ===
  //       groupInformationSinceLastConnection.chatId.toLowerCase()
  //     ) {
  //       const updateChatFeed = chatFeed;
  //       updateChatFeed.groupInformation = groupInformationSinceLastConnection;
  //       setChatFeed(updateChatFeed);
  //     }
  //   }
  // }, [groupInformationSinceLastConnection]);

  useEffect(() => {
    (async function () {
      await getMessagesCall();
    })();
  }, [conversationHash, account, env, chatFeed, pushUser]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationHash, account, env, chatId, chatFeed]);

  useEffect(() => {
    if (
      conversationHash &&
      Object.keys(messages || {}).length &&
      messages?.messages.length &&
      messages?.messages.length <= limit
    ) {
      setChatStatusText('');
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {

    if (chatFeed && !chatFeed?.groupInformation?.isPublic && account) {
      chatFeed?.groupInformation?.members.forEach((acc) => {
        if (
          acc.wallet.toLowerCase() === walletToPCAIP10(account!).toLowerCase()
        ) {
          setIsMember(true);
        }
      });
    }
  }, [account, chatFeed])

  //methods
  const scrollToBottom = () => {
    setTimeout(() => {
      if (listInnerRef.current) {
        listInnerRef.current.scrollTop = listInnerRef.current.scrollHeight + 100;

      }
    }, 0)

  };

  const onScroll = async () => {
    if (listInnerRef.current) {
      const { scrollTop } = listInnerRef.current;
      if (scrollTop === 0) {
        const content = listInnerRef.current;
        const curScrollPos = content.scrollTop;
        const oldScroll = content.scrollHeight - content.clientHeight;

        await getMessagesCall();

        const newScroll = content.scrollHeight - content.clientHeight;
        content.scrollTop = curScrollPos + (newScroll - oldScroll);
      }
    }
  };

  const getMessagesCall = async () => {
    let threadHash;
    if (!messages) {
      threadHash = conversationHash;
    } else {
      threadHash = messages?.lastThreadHash;
    }
    if (threadHash && ((account && chatFeed && !chatFeed?.groupInformation) || (chatFeed && chatFeed?.groupInformation))) {
      const chatHistory = await historyMessages({ chatId, limit, threadHash });
      if (chatHistory?.length) {
        if (Object.keys(messages || {}) && messages?.messages.length) {
          const newChatViewList = appendUniqueMessages(
            messages,
            chatHistory,
            true
          );
          setFilteredMessages(newChatViewList as IMessageIPFSWithCID[]);
        } else {

          setFilteredMessages(chatHistory as IMessageIPFSWithCID[]);
        }
      }
    }
  };

  const setFilteredMessages = (messageList: Array<IMessageIPFSWithCID>) => {
    const updatedMessageList = messageList.filter(
      (msg) => !chatFilterList.includes(msg.cid)
    );

    if (updatedMessageList && updatedMessageList.length) {
      setMessages({
        messages: updatedMessageList,
        lastThreadHash: updatedMessageList[0].link,
      });
    }
  };

  const ifBlurChat = () => {
    return !!(
      chatFeed &&
      chatFeed?.groupInformation &&
      !chatFeed?.groupInformation?.isPublic &&
      ((!isMember && Object.keys(pushUser || {}).length) || !(Object.keys(pushUser || {}).length))
    );
  }

  type RenderDataType = {
    chat: IMessageIPFS;
    dateNum: string;
  };
  const renderDate = ({ chat, dateNum }: RenderDataType) => {
    const timestampDate = formatTime(chat.timestamp);
    dates.add(dateNum);
    return (
      <Span
        margin="15px 0"
        fontSize={theme.fontSize?.timestamp}
        fontWeight={theme.fontWeight?.timestamp}
        color={theme.textColor?.timestamp}
        textAlign="center"
      >
        {timestampDate}
      </Span>
    );
  };
  return (
    <ChatViewListCard
      overflow="hidden scroll"
      flexDirection="column"
      ref={listInnerRef}
      width="100%"
      justifyContent="start"
      padding="0 2px"
      theme={theme}
      blur={
        ifBlurChat()
      }
      onScroll={(e) => {
        e.stopPropagation();
        onScroll();
      }}
    >
      {loading ? <Spinner color={theme.spinnerColor} /> : ''}
      {!loading && (
        <>
          {chatFeed &&
            (chatFeed.publicKey ||
              (chatFeed?.groupInformation &&
                !chatFeed?.groupInformation?.isPublic)) ? (
            <EncryptionMessage id={ENCRYPTION_KEYS.ENCRYPTED} />
          ) : (
            <EncryptionMessage
              id={
                chatFeed?.groupInformation
                  ? ENCRYPTION_KEYS.NO_ENCRYPTED_GROUP
                  : ENCRYPTION_KEYS.NO_ENCRYPTED
              }
            />
          )}

          {chatStatusText && (
            <Section margin="20px 0 0 0">
              <Span
                fontSize="13px"
                color={theme.textColor?.encryptionMessageText}
                fontWeight="400"
              >
                {chatStatusText}
              </Span>
            </Section>
          )}
          {messageLoading ? <Spinner color={theme.spinnerColor} /> : ''}

          {!messageLoading && (
            <>
              <Section
                flexDirection="column"
                justifyContent="start"
                width="100%"
              >
                {messages?.messages &&
                  messages?.messages?.map(
                    (chat: IMessageIPFS, index: number) => {
                      const dateNum = formatTime(chat.timestamp);
                      const position =
                        pCAIP10ToWallet(chat.fromCAIP10).toLowerCase() !==
                          account?.toLowerCase()
                          ? 0
                          : 1;
                      return (
                        <>
                          {dates.has(dateNum)
                            ? null
                            : dateNum ? renderDate({ chat, dateNum }) : null}
                          <Section
                            justifyContent={position ? 'end' : 'start'}
                            margin="7px"
                          >
                            <ChatViewBubble decryptedMessagePayload={chat} key={index} />
                          </Section>
                        </>
                      );
                    }
                  )}
              </Section>
              {!!Object.keys(chatFeed || {}).length &&
                account &&
                checkIfIntent({
                  chat: chatFeed as IFeeds,
                  account: account!,
                }) && (
                  <ApproveRequestBubble
                    chatFeed={chatFeed}
                    chatId={chatId}
                    setChatFeed={setChatFeed}
                  />
                )}
            </>
          )}
        </>
      )}
    </ChatViewListCard>
  );
};

//styles
const ChatViewListCard = styled(Section) <IThemeProps>`
  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.scrollbarColor};
    border-radius: 10px;
  }

  &::-webkit-scrollbar {
    width: 5px;
  }
  ${({ blur }) =>
    blur &&
    `
  filter: blur(12px);
  `}
  overscroll-behavior: contain;
  scroll-behavior: smooth;
`;
