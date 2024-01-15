import { ChangeEvent, useContext, useEffect, useRef, useState } from 'react';

import styled from 'styled-components';
import { MdCheckCircle, MdError } from 'react-icons/md';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import GifPicker from 'gif-picker-react';
import { GroupDTO, IFeeds } from '@pushprotocol/restapi';
import { ToastContainer } from 'react-toastify';

import { Section, Div, Span } from '../../reusables';
import { EmojiIcon } from '../../../icons/Emoji';
import { GifIcon } from '../../../icons/Gif';
import { AttachmentIcon } from '../../../icons/Attachment';
import usePushSendMessage from '../../../hooks/chat/usePushSendMessage';
import { SendCompIcon } from '../../../icons/SendCompIcon';
import { Spinner } from '../../reusables';
import { ThemeContext } from '../theme/ThemeProvider';
import OpenLink from '../../../icons/OpenLink';
import useVerifyAccessControl from '../../../hooks/chat/useVerifyAccessControl';
import useGetGroupByID from '../../../hooks/chat/useGetGroupByID';
import { Modal, ModalHeader } from '../reusables/Modal';
import { ConnectButtonComp } from '../ConnectButton';
import useToast from '../reusables/NewToast';
import { ConditionsInformation } from '../ChatProfile/GroupInfoModal';
import useFetchChat from '../../../hooks/chat/useFetchChat';
import useChatProfile from '../../../hooks/chat/useChatProfile';
import useApproveChatRequest from '../../../hooks/chat/useApproveChatRequest';
import {
  useChatData,
  useClickAway,
  useDeviceWidthCheck,
  usePushChatStream,
} from '../../../hooks';

import type { FileMessageContent } from '../../../types';
import { GIFType, IChatTheme, MODAL_BACKGROUND_TYPE, MODAL_POSITION_TYPE, MessageInputProps } from '../exportedTypes';
import { GUEST_MODE_ACCOUNT, PUBLIC_GOOGLE_TOKEN, device } from '../../../config';
import { checkIfAccessVerifiedGroup, checkIfMember,isValidETHAddress } from '../helpers';
import { InfoContainer } from '../reusables';
import {
  checkIfIntent,
  getDefaultFeedObject,
  getNewChatUser,
  setAccessControl,
} from '../../../helpers';

/**
 * @interface IThemeProps
 * this interface is used for defining the props for styled components
 */
interface IThemeProps {
  theme?: IChatTheme;
}

const ConnectButtonSection = ({ autoConnect }: { autoConnect: boolean }) => {
  const { signer, pushUser } = useChatData();
  return (
    <Section
      width="100%"
      justifyContent="space-between"
      alignItems="center"
      padding="8px"
    >
      {(!signer || !pushUser) && (
        <Span
          padding="8px 8px 8px 16px"
          color="#B6BCD6"
          fontSize="15px"
          fontWeight="400"
          textAlign="start"
        >
          You need to connect your wallet to get started
        </Span>
      )}
      <ConnectButtonComp autoConnect={autoConnect} />
    </Section>
  );
};

export const MessageInput: React.FC<MessageInputProps> = ({
  chatId,
  emoji = true,
  gif = true,
  file = true,
  isConnected = true,
  autoConnect = false,
  verificationFailModalBackground = MODAL_BACKGROUND_TYPE.OVERLAY,
  verificationFailModalPosition = MODAL_POSITION_TYPE.GLOBAL,
  onVerificationFail,
}) => {
  const [typedMessage, setTypedMessage] = useState<string>('');
  const [showEmojis, setShowEmojis] = useState<boolean>(false);
  const [gifOpen, setGifOpen] = useState<boolean>(false);
  const modalRef = useRef(null);
  const fileUploadInputRef = useRef<HTMLInputElement>(null);
  const [fileUploading, setFileUploading] = useState<boolean>(false);
  const [isRules, setIsRules] = useState<boolean>(false);
  const [isMember, setIsMember] = useState<boolean>(false);
  const { approveChatRequest, loading: approveLoading } =
    useApproveChatRequest();
  // const { acceptedRequestMessage, groupInformationSinceLastConnection } =
  //   usePushChatSocket();
  const { chatRequestStream, groupMetaStream } =
    usePushChatStream();
  const [chatFeed, setChatFeed] = useState<IFeeds>({} as IFeeds);
  const theme = useContext(ThemeContext);
  const isMobile = useDeviceWidthCheck(425);
  const { sendMessage, loading } = usePushSendMessage();
  const {
    verifyAccessControl,
    setVerificationSuccessfull,
    verificationSuccessfull,
    verified,
    setVerified,
    loading: accessLoading,
  } = useVerifyAccessControl();
  const {
    account,
    env,
    signer,
    pushUser,
  } = useChatData();
  const { fetchChat } = useFetchChat();
  const { fetchChatProfile } = useChatProfile();
  const { getGroupByID } = useGetGroupByID();
  const statusToast = useToast();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const onChangeTypedMessage = (val: string) => {
    setTypedMessage(val);
  };
  useClickAway(modalRef, () => {
    setShowEmojis(false);
    setGifOpen(false);
  });

  useEffect(() => {
    if (textAreaRef?.current?.style) {
      textAreaRef.current.style.height = 25 + 'px';
      const scrollHeight = textAreaRef.current?.scrollHeight;
      textAreaRef.current.style.height = scrollHeight + 'px';
    }
  }, [textAreaRef, typedMessage]);


  useEffect(() => {
    const storedTimestampJSON = localStorage.getItem(chatId);

    if (storedTimestampJSON) {
      const storedTimestamp = JSON.parse(storedTimestampJSON);
      const currentTimestamp = new Date().getTime();
      const twentyFourHoursInMilliseconds = 24 * 60 * 60 * 1000;

      if (
        Math.abs(currentTimestamp - storedTimestamp) <
        twentyFourHoursInMilliseconds
      ) {
        setVerified(true);
      } else {
        setVerified(false);
        setAccessControl(chatId, true);
      }
    }
  }, [chatId, verified, isMember, account, env, signer]);


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

  // useEffect(() => {
  //   (async () => {
  //     if (
  //       Object.keys(acceptedRequestMessage || {}).length &&
  //       Object.keys(chatFeed || {}).length
  //     ) {
  //       await updateChatFeed();
  //     }
  //   })();
  // }, [acceptedRequestMessage]);

  //need to makea common method for fetching chatFeed to ruse in messageInput
  useEffect(() => {
    (async () => {
      
      if (Object.keys(pushUser || {}).length) {
        const chat = await fetchChat({chatId});
        if (Object.keys(chat || {}).length) setChatFeed(chat as IFeeds);
        else {
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
            setChatFeed(newChatFeed);
          }
        }
      }
    })();
  }, [chatId, account, env, pushUser]);

  useEffect(() => {
    if (!account && !env && !chatId) return;
    if (account && env && chatId && chatFeed && chatFeed?.groupInformation) {
      setIsMember(checkIfMember(chatFeed, account));
      setIsRules(checkIfAccessVerifiedGroup(chatFeed));
    }
  }, [chatId, chatFeed, account, env, pushUser]);
  const addEmoji = (emojiData: EmojiClickData, event: MouseEvent): void => {
    setTypedMessage(typedMessage + emojiData.emoji);
    setShowEmojis(false);
  };

  const handleUploadFile = () => {
    if (fileUploadInputRef.current) {
      fileUploadInputRef.current.click();
    }
  };

  const checkVerification = () => {
    verifyAccessControl({ chatId, did: account! });
  };

  const handleJoinGroup = async () => {
    if (chatFeed && chatFeed?.groupInformation?.isPublic) {
      const response = await pushUser?.chat.accept(chatId);
      if (response) {
        await updateChatFeed();
      }
    } else {
      const sendTextMessage = await sendMessage({
        message: `Hello, please let me join this group, my wallet address is ${account}`,
        chatId: chatFeed?.groupInformation?.groupCreator || '',
        messageType: 'Text',
      });
      if (sendTextMessage) {
        statusToast.showMessageToast({
          toastTitle: 'Success',
          toastMessage: 'Request sent successfully',
          toastType: 'SUCCESS',
          getToastIcon: (size) => <MdCheckCircle size={size} color="green" />,
        });
      } else {
        statusToast.showMessageToast({
          toastTitle: 'Error',
          toastMessage: 'Unable to send request',
          toastType: 'ERROR',
          getToastIcon: (size) => <MdError size={size} color="red" />,
        });
      }
    }
  };

  const uploadFile = async (
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    if (!(e.target instanceof HTMLInputElement)) {
      return;
    }
    if (!e.target.files) {
      return;
    }
    if (
      e.target &&
      (e.target as HTMLInputElement).files &&
      ((e.target as HTMLInputElement).files as FileList).length
    ) {
      const file: File = e.target.files[0];
      if (file) {
        try {
          const TWO_MB = 1024 * 1024 * 2;
          if (file.size > TWO_MB) {
            console.log('Files larger than 2mb is now allowed');
            throw new Error('Files larger than 2mb is now allowed');
          }
          setFileUploading(true);
          const messageType = file.type.startsWith('image') ? 'Image' : 'File';
          const reader = new FileReader();
          let fileMessageContent: FileMessageContent;
          reader.readAsDataURL(file);
          reader.onloadend = async (e): Promise<void> => {
            fileMessageContent = {
              content: e.target!.result as string,
              name: file.name,
              type: file.type,
              size: file.size,
            };

            sendPushMessage(JSON.stringify(fileMessageContent), messageType);
          };
        } catch (err) {
          console.log(err);
        } finally {
          setFileUploading(false);
        }
      }
    }
  };

  const isJoinGroup = () => {
    return !isMember;
  };

  const isNotVerified = () => {
    return Object.keys(pushUser || {}).length && !verified && isMember && isRules;
  };

  const sendPushMessage = async (content: string, type: string) => {
    try {
      const sendMessageResponse = await sendMessage({
        message: content,
        chatId,
        messageType: type as any,
      });
      if (
        sendMessageResponse &&
        typeof sendMessageResponse === 'string' &&
        sendMessageResponse.includes('403')
      ) {
        setAccessControl(chatId, true);
        setVerified(false);
        setVerificationSuccessfull(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sendTextMsg = async () => {
    if (typedMessage.trim() !== '') {
      await sendPushMessage(typedMessage as string, 'Text');
      setTypedMessage('');
    }
  };

  const sendGIF = async (emojiObject: GIFType) => {
    sendPushMessage(emojiObject.url as string, 'GIF');
    setGifOpen(false);
  };

  const updateChatFeed = async () => {

    const chat = await fetchChat({chatId});

    if (Object.keys(chat || {}).length) {
      setChatFeed(chat as IFeeds);
    }
  };

  return (!account || (account === GUEST_MODE_ACCOUNT)) && isConnected ? (
    <TypebarSection
      width="100%"
      overflow="hidden"
      borderRadius="13px"
      position="static"
      padding={'13px 16px'}
      background={`${theme.backgroundColor?.messageInputBackground}`}
      alignItems="center"
      justifyContent="space-between"
    >
      <ConnectButtonSection autoConnect={autoConnect} />
    </TypebarSection>
  ) : 
  !checkIfIntent({ chat: chatFeed, account: account! }) &&
    Object.keys(chatFeed || {}).length ? (
    <TypebarSection
      width="100%"
      overflow="hidden"
      borderRadius={theme.borderRadius?.messageInput}
      position="static"
      border={theme.border?.messageInput}
      padding={`13px 16px`}
      background={`${theme.backgroundColor?.messageInputBackground}`}
      alignItems="center"
      justifyContent="space-between"
    >
      {Object.keys(chatFeed || {}).length && chatFeed?.groupInformation ? (
        <>
          {(isJoinGroup() || isNotVerified()) && (
            <Section
              width="100%"
              justifyContent="space-between"
              alignItems="center"
            >
              <Span
                padding="8px 8px 8px 16px"
                color={theme.textColor?.chatReceivedBubbleText}
                fontSize="15px"
                fontWeight="500"
                textAlign="start"
              >
                {isJoinGroup() && 'Click on the button to join the group'}
                {isNotVerified() && (
                  <>
                    Sending messages requires to staisfy the group rules.{' '}
                    <Link
                      href="https://push.org/docs/chat/build/conditional-rules-for-group/"
                      target="_blank"
                      color={theme.backgroundColor?.chatSentBubbleBackground}
                    >
                      Learn More <OpenLink />
                    </Link>
                  </>
                )}
              </Span>
              <ConnectWrapper>
                <Connect
                  onClick={async () =>
                    isJoinGroup()
                      ? await handleJoinGroup()
                      : await checkVerification()
                  }
                >
                  {isJoinGroup() && (
                    <>
                      {approveLoading ? (
                        <Spinner color="#fff" size="24" />
                      ) : (
                        ' Join Group '
                      )}
                    </>
                  )}
                  {isNotVerified() && (
                    <>
                      {accessLoading ? (
                        <Spinner color="#fff" size="24" />
                      ) : (
                        'Verify Access'
                      )}
                    </>
                  )}
                </Connect>
              </ConnectWrapper>
            </Section>
          )}
          {Object.keys(pushUser || {}).length && !verificationSuccessfull && (
            <Modal width="550px" modalBackground={verificationFailModalBackground} modalPositionType={verificationFailModalPosition}>
              <Section
                margin="5px 0px 0px 0px"
                gap="16px"
                flexDirection="column"
                width="100%"
              >
                <ModalHeader title="Access Failed" />
                <ConditionsInformation
                  theme={theme}
                  groupInfo={chatFeed?.groupInformation}
                  subheader="Please make sure the following conditions
                   are met to pariticpate and send messages."
                  alert={true}
                />
                <ConnectWrapperClose
                  onClick={() => {
                    if (onVerificationFail) {
                      onVerificationFail();
                    }
                    setVerificationSuccessfull(true);
                  }}
                >
                  <ConnectClose>Cancel</ConnectClose>
                </ConnectWrapperClose>
                <InfoContainer
                  cta="https://push.org/docs/chat/build/conditional-rules-for-group/"
                  label="Learn more about access gating rules"
                />
              </Section>
              {/* </Section> */}
            </Modal>
          )}
        </>
      ) : null}
      {
        ((Object.keys(pushUser || {}).length && (isRules ? verified : true) && isMember) ||
          (chatFeed && !chatFeed?.groupInformation)) && (
          <>
            <Section gap="8px" flex="1" position="static">
              {emoji && (
                <Div
                  width="25px"
                  cursor="pointer"
                  height="25px"
                  alignSelf="end"
                  onClick={() => setShowEmojis(!showEmojis)}
                >
                  <EmojiIcon color={theme.iconColor?.emoji} />
                </Div>
              )}
              {showEmojis && (
                <Section
                  ref={modalRef}
                  position="absolute"
                  bottom="2.5rem"
                  left="2.5rem"
                  zIndex="700"
                >
                  <EmojiPicker
                    width={isMobile ? 260 : 320}
                    height={370}
                    onEmojiClick={addEmoji}
                  />
                </Section>
              )}
              <MultiLineInput
                disabled={loading ? true : false}
                theme={theme}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendTextMsg();
                  }
                }}
                placeholder="Type your message..."
                onChange={(e) => onChangeTypedMessage(e.target.value)}
                value={typedMessage}
                ref={textAreaRef}
                rows={1}
              />
            </Section>
            <SendSection position="static">
              {gif && (
                <Section
                  width="34px"
                  height="24px"
                  cursor="pointer"
                  alignSelf="end"
                  onClick={() => setGifOpen(!gifOpen)}
                >
                  <GifIcon />
                </Section>
              )}
              {gifOpen && (
                <Section
                  position="absolute"
                  bottom="2.5rem"
                  zIndex="1"
                  right={isMobile ? '7rem' : '8rem'}
                  ref={modalRef}
                >
                  <GifPicker
                    onGifClick={sendGIF}
                    width={isMobile ? 260 : 320}
                    height={370}
                    tenorApiKey={String(PUBLIC_GOOGLE_TOKEN)}
                  />
                </Section>
              )}
              <Section onClick={handleUploadFile}>
                {!fileUploading && file && (
                  <>
                    <Section
                      width="17"
                      height="24px"
                      cursor="pointer"
                      alignSelf="end"
                    >
                      <AttachmentIcon color={theme.iconColor?.attachment} />
                    </Section>
                    <FileInput
                      type="file"
                      ref={fileUploadInputRef}
                      onChange={(e) => uploadFile(e)}
                    />
                  </>
                )}
              </Section>
              {!(loading || fileUploading) && (
                <Section
                  cursor="pointer"
                  alignSelf="end"
                  height="24px"
                  onClick={() => sendTextMsg()}
                >
                  <SendCompIcon color={theme.iconColor?.sendButton} />
                </Section>
              )}

              {(loading || fileUploading) && (
                <Section alignSelf="end" height="24px">
                  <Spinner color={theme.spinnerColor} size="22" />
                </Section>
              )}
            </SendSection>
          </>
        )}
      <ToastContainer />
    </TypebarSection>
  ) : (
    <></>
  );
};

const TypebarSection = styled(Section)<{ border?: string }>`
  gap: 10px;
  border: ${(props) => props.border || 'none'};
  @media ${device.mobileL} {
    gap: 0px;
  }
`;
const SendSection = styled(Section)`
  gap: 11.5px;
  @media ${device.mobileL} {
    gap: 7.5px;
  }
`;
const MultiLineInput = styled.textarea<IThemeProps>`
  font-family: inherit;
  font-weight: 400;
  transform: translateY(3px);
  font-size: 16px;
  outline: none;
  overflow-y: auto;
  box-sizing: border-box;
  background: ${(props) => props.theme.backgroundColor?.messageInputBackground};
  border: none;
  color: ${(props) => props.theme.textColor?.messageInputText};
  resize: none;
  flex: 1;
  padding-right: 5px;
  align-self: end;
  @media ${device.mobileL} {
    font-size: 14px;
  }
  &&::-webkit-scrollbar {
    width: 4px;
    padding-right: 0px;
  }
  ::-webkit-scrollbar-thumb {
    background: rgb(181 181 186);
    border-radius: 10px;
    height: 50px;
  }
  ::placeholder {
    color: ${(props) => props.theme.textColor?.messageInputText};
    transform: translateY(0px);
    @media ${device.mobileL} {
      font-size: 14px;
    }
  }

  min-height: 25px;
  max-height: 80px;
  word-break: break-word;
`;
const FileInput = styled.input`
  display: none;
`;

const ConnectWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  cursor: pointer;
`;

const StyledButton = styled.button`
  border: 0px;
  outline: 0px;
  padding: 24px 9px;
  font-weight: 500;
  border-radius: 12px;
  font-size: 17px;
  cursor: pointer;
  width: 147px;
  height: 44px;
  text-align: start;
  align-items: center;
  display: flex;
  justify-content: center;
`;

const Connect = styled(StyledButton)`
  color: rgb(255, 255, 255);
  background: #d53a94;
`;

const ConnectWrapperClose = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const StyledButtonClose = styled.button`
  border: 0px;
  outline: 0px;
  padding: 24px 9px;
  font-weight: 500;
  border-radius: 12px;
  font-size: 17px;
  cursor: pointer;
  width: 147px;
  height: 44px;
  text-align: start;
  align-items: center;
  display: flex;
  justify-content: center;
`;

const ConnectClose = styled(StyledButtonClose)`
  color: rgb(255, 255, 255);
  background: #d53a94;
  gap: 8px;
`;

const TokenWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const TokenStyledButton = styled.button`
  border: 0px;
  outline: 0px;
  padding: 22px 9px;
  font-weight: 500;
  border-radius: 12px;
  font-size: 17px;
  cursor: pointer;
  width: 100%;
  height: 44px;
  text-align: start;
  align-items: center;
  display: flex;
  justify-content: center;
`;

const TokenGet = styled(TokenStyledButton)`
  color: #d53a94;
  border: 2px solid #d53a94;
  background: none;
  gap: 8px;
`;
const Link = styled.a`
  color: #d53a94;
  link-decoration: none;
  text-decoration: none;
`;
