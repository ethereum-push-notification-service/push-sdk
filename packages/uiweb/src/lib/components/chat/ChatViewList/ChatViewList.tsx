import React, { useContext, useEffect, useRef, useState } from 'react';

import {
  IMessageIPFS,
  IMessageIPFSWithCID,
  IUser,
} from '@pushprotocol/restapi';
import moment from 'moment';
import styled from 'styled-components';
import { ToastContainer } from 'react-toastify';
import { MdError } from 'react-icons/md';

import { chatLimit } from '../../../config';
import {
  appendUniqueMessages,
  dateToFromNowDaily,
  pCAIP10ToWallet,
  walletToPCAIP10,
} from '../../../helpers';
import { useChatData, usePushChatStream } from '../../../hooks';
import useFetchMessageUtilities from '../../../hooks/chat/useFetchMessageUtilities';
import { Section, Span, Spinner } from '../../reusables';
import { ChatViewBubble } from '../ChatViewBubble';
import { Group, IChatViewListProps } from '../exportedTypes';
import { IChatTheme } from '../theme';
import { ThemeContext } from '../theme/ThemeProvider';

import useFetchChat from '../../../hooks/chat/useFetchChat';
import { ApproveRequestBubble } from './ApproveRequestBubble';
import { ENCRYPTION_KEYS, EncryptionMessage } from './MessageEncryption';
import useGroupMemberUtilities from '../../../hooks/chat/useGroupMemberUtilities';
import { ChatInfoResponse } from '../types';
import useUserProfile from '../../../hooks/useUserProfile';
import useGetGroupByIDnew from '../../../hooks/chat/useGetGroupByIDnew';
import useToast from '../reusables/NewToast';
import { checkIfNewRequest, transformStreamToIMessageIPFSWithCID } from '../helpers';

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
  const { account, user } = useChatData();
  const [chatInfo, setChatInfo] = useState<ChatInfoResponse | null>(null);
  const [groupInfo, setGroupInfo] = useState<Group | null>(null);
  const [userInfo, setUserInfo] = useState<IUser | null>(null);

  const [chatStatusText, setChatStatusText] = useState<string>('');
  const [messages, setMessages] = useState<IMessageIPFSWithCID[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { historyMessages, historyLoading: messageLoading } =
    useFetchMessageUtilities();
  const listInnerRef = useRef<HTMLDivElement>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const { fetchChat } = useFetchChat();
  const { fetchUserProfile } = useUserProfile();
  const { getGroupByIDnew } = useGetGroupByIDnew();
  const { fetchMemberStatus } = useGroupMemberUtilities();
  const chatViewListToast = useToast();

  //hack for stream not working
  const [chatStream, setChatStream] = useState<any>({}); // to track any new messages
  const [chatRequestStream, setChatRequestStream] = useState<any>({}); // to track any new messages

  const [chatAcceptStream, setChatAcceptStream] = useState<any>({}); // to track any new messages
  const [participantRemoveStream, setParticipantRemoveStream] = useState<any>(
    {}
  ); // to track if a participant is removed from group
  const [participantLeaveStream, setParticipantLeaveStream] = useState<any>({}); // to track if a participant leaves a group
  const [participantJoinStream, setParticipantJoinStream] = useState<any>({}); // to track if a participant joins a group

  const [groupUpdateStream, setGroupUpdateStream] = useState<any>({});
  // const {
  //   chatStream,
  //   groupUpdateStream,
  //   chatAcceptStream,
  //   participantJoinStream,
  //   participantLeaveStream,
  //   participantRemoveStream,
  // } = usePushChatStream();

  //event listeners
  usePushChatStream();
  useEffect(() => {
    window.addEventListener('chatStream', (e: any) => setChatStream(e.detail));
    window.addEventListener('chatRequestStream', (e: any) => setChatRequestStream(e.detail));
    window.addEventListener('chatAcceptStream', (e: any) =>
      setChatAcceptStream(e.detail)
    );
    window.addEventListener('participantRemoveStream', (e: any) =>
      setParticipantRemoveStream(e.detail)
    );
    window.addEventListener('participantLeaveStream', (e: any) =>
      setParticipantLeaveStream(e.detail)
    );
    window.addEventListener('participantJoinStream', (e: any) =>
      setParticipantJoinStream(e.detail)
    );
    window.addEventListener('groupUpdateStream', (e: any) =>
      setGroupUpdateStream(e.detail)
    );
    return () => {
      window.removeEventListener('chatStream', (e: any) =>
        setChatStream(e.detail)
      );
      window.removeEventListener('chatRequestStream', (e: any) => setChatRequestStream(e.detail));

      window.removeEventListener('chatAcceptStream', (e: any) =>
        setChatAcceptStream(e.detail)
      );
      window.removeEventListener('participantRemoveStream', (e: any) =>
        setParticipantRemoveStream(e.detail)
      );
      window.removeEventListener('participantLeaveStream', (e: any) =>
        setParticipantLeaveStream(e.detail)
      );
      window.removeEventListener('participantJoinStream', (e: any) =>
        setParticipantJoinStream(e.detail)
      );
      window.removeEventListener('groupUpdateStream', (e: any) =>
        setGroupUpdateStream(e.detail)
      );
    };
  }, []);

  const theme = useContext(ThemeContext);
  const dates = new Set();
  const { env } = useChatData();
  useEffect(() => {
    setChatStatusText('');
  }, [chatId, account, env, user]);

  useEffect(() => {
    setChatInfo(null);
    setMessages([]);
    setGroupInfo(null);
  }, [chatId, account, user, env]);

  useEffect(() => {
    (async () => {
      if (!user) return;
      if (chatId) {
        const chat = await fetchChat({ chatId: chatId });
        if (Object.keys(chat || {}).length) {
          setChatInfo(chat as ChatInfoResponse);
        }

        setLoading(false);
      }
    })();
  }, [chatId, user, account, env]);
  useEffect(() => {
    (async () => {
      let UserProfile, GroupProfile;
      if (
        chatInfo &&
        !chatInfo?.meta?.group &&
        chatInfo?.participants &&
        account
      ) {
        UserProfile = await fetchUserProfile({
          profileId: pCAIP10ToWallet(
            chatInfo?.participants.find(
              (address) => address != walletToPCAIP10(account)
            ) || chatId
          ),
          env,
          user,
        });
        if (UserProfile) setUserInfo(UserProfile);
        setChatStatusText(ChatStatus.FIRST_CHAT);
      } else if (chatInfo && chatInfo?.meta?.group) {
        GroupProfile = await getGroupByIDnew({ groupId: chatId });
        if (GroupProfile) setGroupInfo(GroupProfile);
        else {
          setChatStatusText(ChatStatus.INVALID_CHAT);
        }
      }
    })();
  }, [chatInfo]);

  //moniters stream changes
  useEffect(() => {
    if (
      Object.keys(chatAcceptStream || {}).length > 0 &&
      chatAcceptStream.constructor === Object
    ) {
      const updatedChatInfo = { ...(chatInfo as ChatInfoResponse) };
      if (updatedChatInfo) updatedChatInfo.list = 'CHATS';
      setChatInfo(updatedChatInfo);
    }
  }, [chatAcceptStream]);
  useEffect(() => {
    if (
      Object.keys(chatStream || {}).length > 0 &&
      chatStream.constructor === Object
    ) {
      transformSteamMessage(chatStream);
      setChatStatusText('');
      scrollToBottom();
    }
  }, [chatStream]);

  useEffect(() => {
    if (
      Object.keys(chatRequestStream || {}).length > 0 &&
      chatRequestStream.constructor === Object
    ) {
      transformSteamMessage(chatRequestStream);
      setChatStatusText('');
      scrollToBottom();
    }
  }, [chatRequestStream]);

  useEffect(() => {
    if (
      Object.keys(groupUpdateStream || {}).length > 0 &&
      groupUpdateStream.constructor === Object
    )
      transformGroupDetails(groupUpdateStream);
  }, [groupUpdateStream]);

 
  const transformSteamMessage = (item: any) => {
    if (!user) {
      return;
    }
    if (chatInfo && ((item?.chatId == chatInfo?.chatId) || checkIfNewRequest(item,chatId))) {
      const transformedMessage = transformStreamToIMessageIPFSWithCID(item);
      if (messages && messages.length) {
        const newChatViewList = appendUniqueMessages(
          messages,
          [transformedMessage],
          false
        );
        setFilteredMessages(newChatViewList);
      } else {
        setFilteredMessages([transformedMessage]);
      }
    }
  };
  const transformGroupDetails = (item: any): void => {
    if (groupInfo?.chatId === item?.chatId) {
      const updatedGroupInfo = groupInfo;
      if (updatedGroupInfo) {
        updatedGroupInfo.groupName = item?.meta?.name;
        updatedGroupInfo.groupDescription = item?.meta?.description;
        updatedGroupInfo.groupImage = item?.meta?.image;
        updatedGroupInfo.groupCreator = item?.meta?.owner;
        updatedGroupInfo.isPublic = !item?.meta?.private;
        updatedGroupInfo.rules = item?.meta?.rules;
        setGroupInfo(updatedGroupInfo);
      }
    }
  };

  useEffect(() => {
    if (chatInfo) {
      (async function () {
        await getMessagesCall();
      })();
    }
  }, [chatInfo, user?.readmode(), account, env, chatId]);

  useEffect(() => {
    if (messages && messages?.length && messages?.length <= limit) {
      setChatStatusText('');
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (user && account && groupInfo) {
      (async () => {
        const status = await fetchMemberStatus({
          chatId: groupInfo.chatId!,
          accountId: account,
        });
        if (status && typeof status !== 'string') {
          setIsMember(status?.participant);
        } else {
          //show toast
          chatViewListToast.showMessageToast({
            toastTitle: 'Error',
            toastMessage: 'Error in fetching member details',
            toastType: 'ERROR',
            getToastIcon: (size) => <MdError size={size} color="red" />,
          });
        }
      })();
    }
  }, [
    account,
    groupInfo,
    chatInfo,
    chatAcceptStream,
    participantJoinStream,
    participantLeaveStream,
    participantRemoveStream,
  ]);

  //methods
  const scrollToBottom = () => {
    setTimeout(() => {
      if (listInnerRef.current) {
        listInnerRef.current.scrollTop =
          listInnerRef.current.scrollHeight + 100;
      }
    }, 0);
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
        content.scrollTop = newScroll - oldScroll;
      }
    }
  };

  const getMessagesCall = async () => {
    let reference = null;
    if (messages && messages?.length) {
      reference = messages[0].link;
    }

    if (user) {
      const chatHistory = await historyMessages({
        limit: limit,
        chatId,
        reference,
      });
      if (chatHistory?.length) {
        if (messages && messages?.length) {
          const newChatViewList = appendUniqueMessages(
            messages,
            chatHistory.reverse(),
            true
          );
          setFilteredMessages(newChatViewList as IMessageIPFSWithCID[]);
        } else {
          setFilteredMessages(chatHistory.reverse() as IMessageIPFSWithCID[]);
        }
      }
    }
  };

  const setFilteredMessages = (messageList: Array<IMessageIPFSWithCID>) => {
    const updatedMessageList = messageList.filter(
      (msg) => !chatFilterList.includes(msg.cid)
    );

    if (updatedMessageList && updatedMessageList.length) {
      setMessages([...updatedMessageList]);
    }
  };
  const ifBlurChat = () => {
    return !!(
      user &&
      ((groupInfo && !groupInfo?.isPublic && !isMember) || user?.readmode())
    );
  };

  type RenderDataType = {
    chat: IMessageIPFS;
    dateNum: string;
  };
  const renderDate = ({ chat, dateNum }: RenderDataType) => {
    const timestampDate = dateToFromNowDaily(chat.timestamp as number);
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
      height="100%"
      justifyContent="start"
      padding="0 2px"
      theme={theme}
      blur={ifBlurChat()}
      onScroll={(e) => {
        e.stopPropagation();
        onScroll();
      }}
    >
      {loading ? <Spinner color={theme.spinnerColor} /> : ''}
      {!loading && (
        <>
          {(userInfo && userInfo.publicKey) ||
          (groupInfo && !groupInfo?.isPublic) ? (
            <EncryptionMessage id={ENCRYPTION_KEYS.ENCRYPTED} />
          ) : (
            <EncryptionMessage
              id={
                groupInfo
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

          {
            <>
              <Section
                flexDirection="column"
                justifyContent="start"
                width="100%"
              >
                {messages &&
                  messages?.map((chat: IMessageIPFS, index: number) => {
                    const dateNum = moment(chat.timestamp).format('L');
                    const position =
                      pCAIP10ToWallet(chat.fromDID).toLowerCase() !==
                      account?.toLowerCase()
                        ? 0
                        : 1;
                    return (
                      <>
                        {dates.has(dateNum)
                          ? null
                          : renderDate({ chat, dateNum })}
                        <Section
                          justifyContent={position ? 'end' : 'start'}
                          margin="7px"
                        >
                          <ChatViewBubble
                            decryptedMessagePayload={chat}
                            key={index}
                          />
                        </Section>
                      </>
                    );
                  })}
              </Section>
              {chatInfo && chatInfo?.list === 'REQUESTS' && (
                <ApproveRequestBubble groupInfo={groupInfo} chatId={chatId} />
              )}
            </>
          }
        </>
      )}
      <ToastContainer />
    </ChatViewListCard>
  );
};

//styles
const ChatViewListCard = styled(Section)<IThemeProps>`
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
