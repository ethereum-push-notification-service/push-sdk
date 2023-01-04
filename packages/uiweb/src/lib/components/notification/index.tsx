import * as React from "react";
import * as PropTypes from "prop-types";
import styled from "styled-components";

import IPFSIcon from "../ipfsicon";
import ImageOverlayComponent from "../overlay";
import { ParseMarkdownText } from "../parsetext";
import Loader from "../loader/loader";
import { extractTimeStamp, convertTimeStamp, MediaHelper } from "../../utilities";
import ActionButton from './styled/ActionButton';
import { useDecrypt, DecryptButton } from './decrypt';
import chainDetails from './chainDetails';

import LinkSVG from "../../icons/link.svg";

// ================= Define types
export type chainNameType = "ETH_TEST_GOERLI" | "POLYGON_TEST_MUMBAI" | "ETH_MAINNET" | "POLYGON_MAINNET" | "THE_GRAPH" | undefined;


export type NotificationItemProps = {
  notificationTitle: string | undefined;
  notificationBody: string | undefined;
  cta: string | undefined;
  app: string | undefined;
  icon: string | undefined;
  image: string | undefined;
  url: string | undefined;
  isSpam?: boolean;
  subscribeFn?: () => Promise<unknown>;
  isSubscribedFn?: () => Promise<unknown>;
  theme: string | undefined;
  chainName: chainNameType;
  isSecret?: boolean;
  decryptFn?: () => Promise<{ title: string, body: string, cta: string, image: string }>;
};


type ContainerDataType = {
  timestamp?: string;
};

type ContentSectionDataType = {
  cta?: boolean;
};

type ChannelTitleDataType = {
  cta?: boolean;
};

type ChannelDescLabelDataType = {
  cta?: boolean;
}

type MetaDataType = {
  hidden?: boolean;
};

type MetaInfoType = MetaDataType & { hasLeft: boolean }

// ================= Define base component
export const NotificationItem: React.FC<NotificationItemProps> = ({
  notificationTitle,
  notificationBody,
  cta,
  app,
  icon,
  image,
  url,
  isSpam, //for rendering the spam conterpart of the notification component
  isSubscribedFn, //A function for getting if a user is subscribed to the channel in question
  subscribeFn, //A function for subscribing to the spam channel
  theme, //for specifying light and dark theme
  chainName,
  isSecret,
  decryptFn
}) => {
  const { notificationBody: parsedBody, timeStamp } = extractTimeStamp(
    notificationBody || ""
  );

  const {
    notifTitle, notifBody, notifCta, notifImage,
    setDecryptedValues,
    isSecretRevealed,
  } = useDecrypt({ notificationTitle, parsedBody, cta, image }, isSecret);

  const isCtaURLValid = MediaHelper.validURL(notifCta);
  const isChannelURLValid = MediaHelper.validURL(url);

  // store the image to be displayed in this state variable
  const [imageOverlay, setImageOverlay] = React.useState("");
  const [subscribeLoading, setSubscribeLoading] = React.useState(false);
  const [isSubscribed, setIsSubscribed] = React.useState(true); //use this to confirm if this is s

  const showMetaInfo = isSecret || timeStamp;
  // console.log({
  //   chainName,
  //   rightIcon,
  //   ai: ChainImages['CHAIN_ICONS']
  // })
  const gotToCTA = (e: React.SyntheticEvent<HTMLElement>) => {
    e.stopPropagation();
    if (!isCtaURLValid) return;
    window.open(notifCta, "_blank");
  };

  const goToURL = (e: React.SyntheticEvent<HTMLElement>) => {
    e.stopPropagation();
    if (!isChannelURLValid) return;
    window.open(url, "_blank");
  };

  /**
   * A function which wraps around the function to subscribe a user to a channel 
   * @returns 
   */
  const onSubscribe = async (clickEvent: React.SyntheticEvent<HTMLElement>) => {
    clickEvent.preventDefault();
    clickEvent.stopPropagation();
  
    if (!subscribeFn) return;
    try {
      setSubscribeLoading(true);
      await subscribeFn();
      setIsSubscribed(true);
    } finally {
      setSubscribeLoading(false);
    }
  };

  const onDecrypt = async () => {
    if (decryptFn) {
      try {
        const decryptedPayload = await decryptFn();
        // to check if always both title, body are present
        if (decryptedPayload) {
          setDecryptedValues(decryptedPayload);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  React.useEffect(() => {
    if (!isSpam || !isSubscribedFn) return;
    
    isSubscribedFn().then((res: unknown) => {
      setIsSubscribed(Boolean(res));
    })

  },[isSubscribedFn, isSpam]);
  
  if (isSubscribed && isSpam) return null;

  // render
  return (
    <Container
      timestamp={timeStamp}
      theme={theme}
    >
      {/* header that only pops up on small devices */}
      <MobileHeader theme={theme}>
        <HeaderButton theme={theme}>
          <ImageContainer theme={theme}>
            <IPFSIcon icon={icon} />
          </ImageContainer>
          <ChannelName onClick={goToURL}>
            {app}
          </ChannelName>
        </HeaderButton>
        {chainName && chainDetails[chainName] ? (
          <BlockchainContainer>
            <ChainIconSVG>{chainDetails[chainName].icon}</ChainIconSVG>
          </BlockchainContainer>
        ) : null}
        </MobileHeader>
      {/* header that only pops up on small devices */}

      {/* content of the component */}
      <ContentSection onClick={isCtaURLValid ? gotToCTA : undefined} theme={theme} cta={isCtaURLValid}>
        {/* section for media content */}
        {notifImage &&
          // if its an image then render this
          (!MediaHelper.isMediaSupportedVideo(notifImage) ? (
            <MobileImage
              theme={theme}
              style={{ cursor: "pointer" }}
              onClick={() => setImageOverlay(notifImage || "")}
            >
              <img src={notifImage} alt="" />
            </MobileImage>
          ) : // if its a youtube url, RENDER THIS
          MediaHelper.isMediaYoutube(notifImage) ? (
            <MobileImage theme={theme}>
              <iframe
                id="ytplayer"
                width="640"
                allow="fullscreen;"
                height="360"
                src={MediaHelper.isMediaExternalEmbed(notifImage)}
                title="Youtube"
              ></iframe>
            </MobileImage>
          ) : (
            // if its aN MP4 url, RENDER THIS
            <MobileImage theme={theme}>
              <video width="360" height="100%" controls>
                <source src={notifImage} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </MobileImage>
          ))}
        {/* section for media content */}

        {/* section for text content */}
        <ChannelDetailsWrapper>
          <ChannelTitle 
            cta={isCtaURLValid}
            theme={theme}
          >
            <ChannelTitleText>
              {notifTitle}
            </ChannelTitleText>
            {/* display link svg if notification has a valid cta url */}
            {
              isCtaURLValid
              ?
                <img src={LinkSVG} alt="CTA link" style={{height: "18px", marginLeft: "7px"}} />
              :
                ""
            }
          </ChannelTitle>
          <ChannelDesc>
            <ChannelDescLabel cta={isCtaURLValid} theme={theme}>
              <ParseMarkdownText text={notifBody} />
            </ChannelDescLabel>
          </ChannelDesc>
        </ChannelDetailsWrapper>
        {/* section for text content */}

        <ButtonGroupContainer>
          <ButtonGroup>
            {/* include a channel opt into */}
            {isSpam && (
              <ActionButton onClick={onSubscribe}>
                {subscribeLoading ? <Loader /> : "opt-in"}
              </ActionButton>
            )}
            {/* include a channel opt into */}

            {isSecret ? (
              <DecryptButton decryptFn={onDecrypt} isSecretRevealed={isSecretRevealed} />
            ): null}
          </ButtonGroup>
        </ButtonGroupContainer>

      </ContentSection>
      {/* content of the component */}

      {/* Meta Data section */}
      <ChannelMetaInfo hidden={!showMetaInfo} hasLeft={false}>
        {/* For left aligned items use ChannelMetaInfoLeft as parent */}
        <ChannelMetaInfoLeft hidden></ChannelMetaInfoLeft>

        {/* For right aligned items use ChannelMetaInfoRight */}
        <ChannelMetaInfoRight hidden={!showMetaInfo}>
          {isSecret ? (
            <SecretIconContainer>
              <SecretIcon></SecretIcon>
            </SecretIconContainer>
          ): null}
          
          {timeStamp ? (
            <TimestampLabel theme={theme}>
              {convertTimeStamp(timeStamp)}
            </TimestampLabel>
          ) : null}
        </ChannelMetaInfoRight>
      </ChannelMetaInfo>

      {/* add image overlay for full screen images */}
      <ImageOverlayComponent
        imageOverlay={imageOverlay}
        setImageOverlay={setImageOverlay}
      />
      {/* add image overlay for full screen images */}
    </Container>
  );
};

// ================= Define default props
NotificationItem.propTypes = {
  notificationBody: PropTypes.string,
  notificationTitle: PropTypes.string,
  cta: PropTypes.string,
  image: PropTypes.string,
  app: PropTypes.string,
  url: PropTypes.string,
  isSpam: PropTypes.bool,
  subscribeFn: PropTypes.func,
  isSubscribedFn: PropTypes.func,
  theme: PropTypes.string
};

NotificationItem.defaultProps = {
  notificationTitle: "",
  notificationBody: "",
  cta: "",
  app: "",
  image: "",
  url: "",
  isSpam: false,
  theme: "light",
};

// ================= Define styled components
// ================= Define styled components
const MD_BREAKPOINT = "50050px"; //set an arbitrarily large number because we no longer use this breakpoint
const SM_BREAKPOINT = "900px";

const GUTTER_SPACE = {
  LARGE: '8px',
  SMALL: '8px'
};

const ContentSection = styled.div<ContentSectionDataType>`
  display: flex;
  padding: 12px;

  cursor: ${(props) => (props.cta ? "pointer" : "default")};

  &:hover{
    background: ${(props) => (props.cta ? (props.theme === "light" ? "#e8eaf680" : "#404650") : "none")};
  }
  
  @media (min-width: ${SM_BREAKPOINT}) {
    align-items: flex-start;
    flex-direction: row;
    gap: 20px;
    justify-content: space-between;
  }
  @media (max-width: ${SM_BREAKPOINT}) {
    flex-direction: column;
  }
`;

const BlockchainContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
`;

const ChainIconSVG = styled.div`
  width: 20px;
  height: 20px;

  svg, svg image, img {
    width: 100%;
    height: 100%;
  }
  @media (max-width: ${SM_BREAKPOINT}) {
    width: 18px;
    height: 18px;
  }
`;

const MobileImage = styled.div`
  img,
  iframe,
  video {
    max-width: 100% !important;
    height: 100% !important;
    object-fit: fill;
    border-radius: 10px;
    border: 0;
  }

  @media (min-width: ${SM_BREAKPOINT}) {
    border: 1px solid ${props => props.theme === 'light' ? '#ededed' : '#444'};
    border-radius: 10px;
    min-width: 220px;
    width: 220px;
    height: 200px;
  }

  @media (max-width: ${SM_BREAKPOINT}) {
    display: block;
    width: 100%;
    max-height: 200px;
    margin-bottom: 12px;
    border: 0;

    img,
    iframe,
    video {
      border: 0;
      border-radius: 0;
    }
  }
`;

const ImageContainer = styled.span`
  background: ${(props) => (props.theme === "light" ? "#ededed" : "#444")};
  display: inline-block;
  margin-right: 10px;
  border-radius: 5px;
  width: 24px;
  height: 24px;
  @media (max-width: ${SM_BREAKPOINT}) {
    width: 24px;
    height: 24px;
  }
`;

const ChannelDetailsWrapper = styled.div`
   display: flex;
   flex-direction: column;
   flex-grow: 4;
`;

const Container = styled.div<ContainerDataType>`
  position: relative;
  overflow: hidden;
  font-family: Strawford, sans-serif;
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  border: ${(props) =>
    props.theme === "light"
      ? "1px solid #D9D9D9"
      : "1px solid #4A4F67"};
  background: ${(props) => (props.theme === "light" ? "#fff" : "#2F3137")};
  border-radius: 10px;
  margin: 15px 0px;
  justify-content: center;
  justify-content: space-between;
  @media (max-width: ${MD_BREAKPOINT}) {
    flex-direction: column;
  }
`;

const MobileHeader = styled.div`
  display: none;
  @media (max-width: ${MD_BREAKPOINT}) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${GUTTER_SPACE.LARGE};
    font-size: 14px;
    border-bottom: ${(props) => props.theme === "light" ? "1px solid #ededed" : "1px solid #444"};
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    text-align: left;
  }
  @media (max-width: ${SM_BREAKPOINT}) {
    padding: ${GUTTER_SPACE.SMALL};
    font-size: 14px;
  }
`;

const ChannelName = styled.div`
  cursor: pointer;
  &:hover{
    text-decoration: underline;
  }
`

const HeaderButton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  color: ${(props) => (props.theme === "light" ? "#333333" : "#C5CAE9")};
`;

const ChannelTitle = styled.div<ChannelTitleDataType>`
  width: fit-content;
  display: flex;
  align-items: center;
  text-align: left;
  margin-bottom: 8px;
  
  &:hover{
    text-decoration: ${(props) => (props.cta ? "underline" : "none")};
  }
  
  @media (max-width: ${MD_BREAKPOINT}) {
    color: ${(props) => (props.theme === "light" ? "#333333" : "#C5CAE9")};
  }

  @media (max-width: ${SM_BREAKPOINT}) {
    margin-bottom: 6px;
  }
`;

const ChannelTitleText = styled.div`
  font-size: 18px;
  font-weight: 400;
`

const ChannelDesc = styled.div`
  line-height: 20px;
  flex: 1;
  display: flex;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.75);
  font-weight: 400;
  flex-direction: column;
`;

const ChannelDescLabel = styled.label<ChannelDescLabelDataType>`
  cursor: ${(props) => (props.cta ? "pointer" : "default")};
  color: ${(props) => (props.theme === "light" ? "#333333" : "#C5CAE9")};
  flex: 1;
  margin: 0px;
  text-align: left;
`;


const ChannelMetaInfo = styled.div<MetaInfoType>`
  display: ${(props) => (props.hidden ? "none" : "flex")};
  flex-direction: row;
  justify-content: ${(props) => (props.hasLeft ? "space-between" : "end")};
`;

const ChannelMetaSection = styled.div<MetaDataType>`
  display: ${(props) => (props.hidden ? "none" : "flex")};
  align-items: center;
`;

const ChannelMetaInfoLeft = styled(ChannelMetaSection)`
  justify-content: start;
`;

const ChannelMetaInfoRight = styled(ChannelMetaSection)`
  justify-content: end;
`;

const TimestampLabel = styled.label`
  color: #808080;
  border-radius: 0;
  border-top-left-radius: 6px;
  border-bottom-right-radius: 10px;
  border-right: 0;
  border-bottom: 0;
  margin-bottom: -1px;
  margin-right: -1px;
  font-weight: 600;
  font-size: 10px;
  padding: 6px 10px 6px 0px;
`;

const SecretIconContainer = styled.div`
  margin: 6px;
`;

const SecretIcon = styled.div`  
  width: 12px;
  height: 12px;
  
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    #e20880 12.5%,
    #674c9f 49.89%,
    #35c5f3 87.5%
  );
`

const ButtonGroupContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
`;