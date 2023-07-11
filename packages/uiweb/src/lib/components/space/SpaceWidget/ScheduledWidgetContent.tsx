import styled from 'styled-components';

import { Button, Container, Image, Item, Text } from '../../../config';
import { formatDate } from '../../../helpers';

import SpacesIcon from '../../../icons/Spaces.svg';
import TwitterIcon from '../../../icons/twitterVector.svg';
import CopyIcon from '../../../icons/copyVector.svg';
import AtIcon from '../../../icons/atVector.svg';
import { SpaceDTO } from '@pushprotocol/restapi';
import { useSpaceData } from '../../../hooks';
import { useEffect, useState } from 'react';

interface ScheduledWidgetContentProps {
  account?: string;
  spaceData?: SpaceDTO;
  shareUrl?: string;

  // temp props only for testing demo purpose for now
  isHost?: boolean;
  isTimeToStartSpace?: boolean;
  isMember?: boolean;
  isSpaceLive: boolean;
  setIsSpaceLive: React.Dispatch<React.SetStateAction<boolean>>;
}
export const ScheduledWidgetContent: React.FC<ScheduledWidgetContentProps> = ({
  account,
  spaceData,
  shareUrl,
  isHost,
  isMember,
  isSpaceLive,
  setIsSpaceLive,
}: ScheduledWidgetContentProps) => {
  const isTimeToStartSpace = true;
  const { spacesObjectRef, initSpaceObject, spaceObjectData } = useSpaceData();
  const [isStarted, setIsStarted] = useState<boolean>(false);

  const handleStartSpace = async () => {
    console.log('initializing space object');
    await initSpaceObject(spaceData?.spaceId as string);

    console.log('creating audio stream');
    await spacesObjectRef.current.createAudioStream();

    setIsStarted(true);
    console.log('Space Started');
  };

  const handleShareTweet = () => {
    if (!shareUrl) return;
    const url = shareUrl;
    const tweetText = 'Join this Space:'; // Replace with your desired tweet text

    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}&url=${encodeURIComponent(url)}`;

    window.open(tweetUrl, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      if (!shareUrl) return;
      const url = shareUrl;
      await navigator.clipboard.writeText(url);
      // add a success toast here
      console.log('URL copied to clipboard:', url);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  useEffect(() => {
    async function startSpace() {
      if (isSpaceLive) return;
      if (!spaceObjectData?.connectionData?.local.stream || !isStarted) return;
      await spacesObjectRef.current.start({
        livepeerApiKey: '2638ace1-0a3a-4853-b600-016e6125b9bc',
      });
      setIsStarted(false);
      setIsSpaceLive && setIsSpaceLive(true);
    }
    startSpace();
  }, [isStarted]);

  console.log('Rendering ScheduledWidgetContent');
  console.log('isStarted?', isStarted);

  return (
    <Container
      display={'flex'}
      height={'100%'}
      alignItems={'center'}
      flexDirection={'column'}
      justifyContent={'center'}
      gap={'15px'}
      padding={'0 24px'}
    >
      <Image
        width={'41px'}
        height={'41px'}
        src={SpacesIcon}
        alt="Spaces Icon"
      />
      {isHost ? (
        isTimeToStartSpace ? (
          <SpaceInfoText>It’s time to start your space</SpaceInfoText>
        ) : (
          <SpaceInfoText>
            Your space is scheduled. <br /> Share and let people know when to
            join!
          </SpaceInfoText>
        )
      ) : (
        <SpaceInfoText>
          This space will go live on{' '}
          {formatDate((spaceData?.scheduleAt as any) || new Date())}
        </SpaceInfoText>
      )}
      {isHost && isTimeToStartSpace && (
        <Button
          padding={'9px 34px'}
          borderRadius={'8px'}
          background={'#8B5CF6'}
          border={'1px solid #703BEB'}
          cursor={'pointer'}
          onClick={handleStartSpace}
        >
          <Text fontSize="14px" fontWeight={600} color="#fff">
            Start this space
          </Text>
        </Button>
      )}
      {!isHost && !isMember && (
        <Button
          padding={'9px 34px'}
          borderRadius={'8px'}
          background={'#8B5CF6'}
          border={'1px solid #703BEB'}
          cursor={'pointer'}
        >
          <Text fontSize="14px" fontWeight={600} color="#fff">
            Remind Me
          </Text>
        </Button>
      )}
      {!isHost && isMember && (
        <Button
          padding={'9px 12px'}
          borderRadius={'8px'}
          background={'#fff'}
          border={'1px solid #D4D4D8'}
          cursor={'pointer'}
        >
          <Text fontSize="14px" fontWeight={600} color="#333333">
            Remove Reminder
          </Text>
        </Button>
      )}
      {(!isHost || (isHost && !isTimeToStartSpace)) && shareUrl && (
        <Item display={'flex'} gap={'13px'}>
          <ShareLinkItem>
            <ShareLinkButton onClick={handleShareTweet}>
              <Image
                src={TwitterIcon}
                alt="Twitter Icon"
                width={'25px'}
                height={'22px'}
              />
            </ShareLinkButton>
            <Text fontSize={'12px'} fontWeight={600}>
              Twitter
            </Text>
          </ShareLinkItem>
          <ShareLinkItem>
            <ShareLinkButton onClick={handleCopyLink}>
              <Image
                src={CopyIcon}
                alt="Copy Icon"
                width={'25px'}
                height={'22px'}
              />
            </ShareLinkButton>
            <Text fontSize={'12px'} fontWeight={600}>
              Copy Link
            </Text>
          </ShareLinkItem>
          <ShareLinkItem>
            <ShareLinkButton>
              <Image
                src={AtIcon}
                alt="At Icon"
                width={'25px'}
                height={'22px'}
              />
            </ShareLinkButton>
            <Text fontSize={'12px'} fontWeight={600}>
              Email
            </Text>
          </ShareLinkItem>
        </Item>
      )}
    </Container>
  );
};

export const SpaceInfoText = styled.span`
  font-size: 18px;
  font-weight: 600;
  text-align: center;
`;

const ShareLinkItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`;

const ShareLinkButton = styled.button`
  background: #e4e4e7;
  border-radius: 14px;
  padding: 16px;
  border: none;
  cursor: pointer;
`;
