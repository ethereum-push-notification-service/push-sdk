import {
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import styled from 'styled-components';
import { TwitterTweetEmbed } from 'react-twitter-embed';

import { Section, Span, Image } from '../../reusables';
import { checkTwitterUrl } from '../helpers/twitter';
import { ChatDataContext } from '../../../context';
import { useChatData } from '../../../hooks';
import { ThemeContext } from '../theme/ThemeProvider';

import { FileMessageContent } from '../../../types';
import { IMessagePayload, TwitterFeedReturnType } from '../exportedTypes';
import { FILE_ICON } from '../../../config';
import {
  formatFileSize,
  getPfp,
  pCAIP10ToWallet,
  shortenText,
} from '../../../helpers';
import { formatTime } from '../../../helpers/timestamp';

const SenderMessageAddress = ({ chat }: { chat: IMessagePayload }) => {
  const { account } = useContext(ChatDataContext);
  const theme = useContext(ThemeContext);
  return (
    <>
      {(chat.fromCAIP10).split(':')[1] !== account && (
        <Span
          theme={theme}
          alignSelf="start"
          textAlign="start"
          fontSize={theme.fontSize?.chatReceivedBubbleAddressText}
          fontWeight={theme.fontWeight?.chatReceivedBubbleAddressText}
          color={theme.textColor?.chatReceivedBubbleAddressText}
        >
          {chat.fromCAIP10.split(':')[1].slice(0, 6)}...
          {chat.fromCAIP10.split(':')[1].slice(-6)}
        </Span>
      )}
    </>
  );
};

const SenderMessageProfilePicture = ({ chat }: { chat: IMessagePayload }) => {
  const { account, env } = useContext(ChatDataContext);
  const [pfp, setPfp] = useState<string>('');
  const getUserPfp = async () => {
    const pfp = await getPfp({
      account: chat.fromCAIP10.split(':')[1],
      env: env,
    });
    if (pfp) {
      setPfp(pfp);
    }
  };
  useEffect(() => {
    getUserPfp();
  }, [account, chat.fromCAIP10]);
  return (
    <Section justifyContent="start" alignItems="start">
      {chat.fromCAIP10.split(':')[1] !== account && (
        <Section alignItems="start">
          {pfp && (
            <Image
              src={pfp}
              alt="profile picture"
              width="40px"
              height="40px"
              borderRadius="50%"
            />
          )}
        </Section>
      )}
    </Section>
  );
};

const MessageWrapper = ({
  chat,
  children,
  isGroup,
  maxWidth,
}: {
  chat: IMessagePayload;
  children: ReactNode;
  isGroup: boolean;
  maxWidth?: string;
}) => {
  const theme = useContext(ThemeContext);
  return (
    <Section
      theme={theme}
      flexDirection="row"
      justifyContent="start"
      gap="6px"
      width="fit-content"
      maxWidth={maxWidth || 'auto'}
    >
      {isGroup && <SenderMessageProfilePicture chat={chat} />}
      <Section justifyContent="start" flexDirection="column">
        {isGroup && <SenderMessageAddress chat={chat} />}
        {children}
      </Section>
   
    </Section>
  );
};

const MessageCard = ({
  chat,
  position,
  isGroup,
}: {
  chat: IMessagePayload;
  position: number;
  isGroup: boolean;
}) => {
  const theme = useContext(ThemeContext);
  const time = formatTime(chat.timestamp)
  return (
    <MessageWrapper chat={chat} isGroup={isGroup} maxWidth="70%">
      <Section
        gap="5px"
        background={
          position
            ? `${theme.backgroundColor?.chatSentBubbleBackground}`
            : `${theme.backgroundColor?.chatReceivedBubbleBackground}`
        }
        padding="8px 12px"
        borderRadius={position ? '12px 0px 12px 12px' : '0px 12px 12px 12px'}
        margin="5px 0"
        alignSelf={position ? 'end' : 'start'}
        justifyContent="start"
        minWidth="71px"
        position="relative"
        width="fit-content"
        color={
          position
            ? `${theme.textColor?.chatSentBubbleText}`
            : `${theme.textColor?.chatReceivedBubbleText}`
        }
      >
        {' '}
        <Section flexDirection="column" padding="5px 0 15px 0">
          {chat.messageContent.split('\n').map((str) => (
            <Span
              key={Math.random().toString()}
              alignSelf="start"
              textAlign="left"
              fontSize={
                position
                  ? `${theme.fontSize?.chatSentBubbleText}`
                  : `${theme.fontSize?.chatReceivedBubbleText}`
              }
              fontWeight={
                position
                  ? `${theme.fontWeight?.chatSentBubbleText}`
                  : `${theme.fontWeight?.chatReceivedBubbleText}`
              }
              color={
                position
                  ? `${theme.textColor?.chatSentBubbleText}`
                  : `${theme.textColor?.chatReceivedBubbleText}`
              }
            >
              {str}
            </Span>
          ))}
        </Section>
        <Span
          position="absolute"
          fontSize={
            position
              ? `${theme.fontSize?.chatSentBubbleTimestampText}`
              : `${theme.fontSize?.chatReceivedBubbleTimestampText}`
          }
          fontWeight={
            position
              ? `${theme.fontWeight?.chatSentBubbleTimestampText}`
              : `${theme.fontWeight?.chatReceivedBubbleTimestampText}`
          }
          color={
            position
              ? `${theme.textColor?.chatSentBubbleText}`
              : `${theme.textColor?.chatReceivedBubbleText}`
          }
          bottom="6px"
          right="10px"
        >
          {time}
        </Span>
      </Section>
    </MessageWrapper>
  );
};

const FileCard = ({
  chat,
  isGroup,
}: {
  chat: IMessagePayload;
  position: number;
  isGroup: boolean;
}) => {
  const fileContent: FileMessageContent = JSON.parse(chat.messageContent);
  const name = fileContent.name;

  const content = fileContent.content as string;
  const size = fileContent.size;

  return (
    <MessageWrapper maxWidth="fit-content" chat={chat} isGroup={isGroup}>
      <Section
        alignSelf="start"
        maxWidth="100%"
        margin="5px 0"
        background="#343536"
        borderRadius="8px"
        justifyContent="space-around"
        padding="10px 13px"
        gap="15px"
        width="fit-content"
      >
        <Image
          src={FILE_ICON(name.split('.').slice(-1)[0])}
          alt="extension icon"
          width="20px"
          height="20px"
        />
        <Section flexDirection="column" gap="5px">
          <Span color="#fff" fontSize="15px">
            {shortenText(name, 11)}
          </Span>
          <Span color="#fff" fontSize="12px">
            {formatFileSize(size)}
          </Span>
        </Section>
        <FileDownloadIconAnchor
          href={content}
          target="_blank"
          rel="noopener noreferrer"
          download
        >
          <FileDownloadIcon className="fa fa-download" aria-hidden="true" />
        </FileDownloadIconAnchor>
      </Section>
    </MessageWrapper>
  );
};

const ImageCard = ({
  chat,
  position,
  isGroup,
}: {
  chat: IMessagePayload;
  position: number;
  isGroup: boolean;
}) => {
  return (
    <MessageWrapper chat={chat} isGroup={isGroup}>
      <Section
        alignSelf={position ? 'end' : 'start'}
        maxWidth="65%"
        width="fit-content"
        margin="5px 0"
      >
        <Image
          src={JSON.parse(chat.messageContent).content}
          alt=""
          width="100%"
          borderRadius={position ? '12px 0px 12px 12px' : '0px 12px 12px 12px'}
        />
      </Section>
    </MessageWrapper>
  );
};

const GIFCard = ({
  chat,
  position,
  isGroup,
}: {
  chat: IMessagePayload;
  position: number;
  isGroup: boolean;
}) => {
  return (
    <MessageWrapper chat={chat} isGroup={isGroup} maxWidth="fit-content">
      <Section
        alignSelf={position ? 'end' : 'start'}
        maxWidth="65%"
        margin="5px 0"
        width="fit-content"
      >
        <Image
          src={chat.messageContent}
          alt=""
          width="100%"
          borderRadius={position ? '12px 0px 12px 12px' : '0px 12px 12px 12px'}
        />
      </Section>
    </MessageWrapper>
  );
};

const TwitterCard = ({
  chat,
  tweetId,
  isGroup,
  position,
}: {
  chat: IMessagePayload;
  tweetId: string;
  isGroup: boolean;
  position: number;
}) => {
  return (
    <MessageWrapper chat={chat} isGroup={isGroup} maxWidth="fit-content">
      <Section
        alignSelf={position ? 'end' : 'start'}
        maxWidth="100%"
        width="fit-content"
        margin="5px 0"
      >
        <TwitterTweetEmbed tweetId={tweetId} />
      </Section>
    </MessageWrapper>
  );
};

export const ChatViewBubble = ({ decryptedMessagePayload }: { decryptedMessagePayload: IMessagePayload }) => {
  const { account } = useChatData();
  const position =
    pCAIP10ToWallet(decryptedMessagePayload.fromCAIP10).toLowerCase() !== account?.toLowerCase()
      ? 0
      : 1;
  const { tweetId, messageType }: TwitterFeedReturnType = checkTwitterUrl({
    message: decryptedMessagePayload?.messageContent,
  });
  const [isGroup, setIsGroup] = useState<boolean>(false);
  useEffect(() => {
    if ((decryptedMessagePayload.toCAIP10).split(':')[0] === 'eip155') {
      if (isGroup) {
        setIsGroup(false);
      }
    } else {
      if (!isGroup) {
        setIsGroup(true);
      }
    }
  }, [decryptedMessagePayload.toCAIP10, isGroup]);

  if (messageType === 'TwitterFeedLink') {
    decryptedMessagePayload.messageType = 'TwitterFeedLink';
  }

  if (decryptedMessagePayload.messageType === 'GIF') {
    return <GIFCard isGroup={isGroup} chat={decryptedMessagePayload} position={position} />;
  }
  if (decryptedMessagePayload.messageType === 'Image') {
    return <ImageCard isGroup={isGroup} chat={decryptedMessagePayload} position={position} />;
  }
  if (decryptedMessagePayload.messageType === 'File') {
    return <FileCard isGroup={isGroup} chat={decryptedMessagePayload} position={position} />;
  }
  if (decryptedMessagePayload.messageType === 'TwitterFeedLink') {
    return (
      <TwitterCard
        tweetId={tweetId}
        isGroup={isGroup}
        chat={decryptedMessagePayload}
        position={position}
      />
    );
  }
  return <MessageCard isGroup={isGroup} chat={decryptedMessagePayload} position={position} />;
};

const FileDownloadIcon = styled.i`
  color: #575757;
`;

const FileDownloadIconAnchor = styled.a`
  font-size: 20px;
`;
