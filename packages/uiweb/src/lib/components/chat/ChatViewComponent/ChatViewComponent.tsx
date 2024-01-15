import React, { useContext } from 'react';
import { IChatTheme, IChatViewComponentProps, MODAL_BACKGROUND_TYPE, MODAL_POSITION_TYPE } from '../exportedTypes';

import { Section, Span } from '../../reusables';
import { ChatViewList } from '../ChatViewList';
import { chatLimit, device } from '../../../config';

import { ThemeContext } from '../theme/ThemeProvider';
import { useChatData } from '../../../hooks/chat/useChatData';
import { MessageInput } from '../MessageInput';
import { ChatProfile } from '../ChatProfile';
import styled from 'styled-components';
import useMediaQuery from '../../../hooks/useMediaQuery';

/**
 * @interface IThemeProps
 * this interface is used for defining the props for styled components
 */
interface IThemeProps {
  theme?: IChatTheme;
}

export const ChatViewComponent: React.FC<IChatViewComponentProps> = (
  options: IChatViewComponentProps
) => {
  const {
    chatId,
    chatFilterList = [],
    messageInput = true,
    chatViewList = true,
    chatProfile = true,
    limit = chatLimit,
    emoji = true,
    file = true,
    gif = true,
    isConnected = true,
    autoConnect = false,
    onVerificationFail,
    groupInfoModalBackground = MODAL_BACKGROUND_TYPE.OVERLAY,
    groupInfoModalPositionType =  MODAL_POSITION_TYPE.GLOBAL,
    verificationFailModalBackground = MODAL_BACKGROUND_TYPE.OVERLAY,
    verificationFailModalPosition = MODAL_POSITION_TYPE.GLOBAL,
    component=null
  } = options || {};

  const { env, signer, account } = useChatData();

  // const [conversationHash, setConversationHash] = useState<string>();

  const theme = useContext(ThemeContext);

  const isMobile = useMediaQuery(device.mobileL);

  return (
    <Conatiner
      width="100%"
      height="inherit"
      flexDirection="column"
      justifyContent="space-between"
      overflow="hidden"
      background={theme.backgroundColor?.chatViewComponentBackground}
      borderRadius={theme.borderRadius?.chatViewComponent}
      padding="13px"
      theme={theme}
    >
      {chatProfile && <ChatProfile component={component} chatId={chatId}  groupInfoModalBackground={groupInfoModalBackground} groupInfoModalPositionType={groupInfoModalPositionType}/>}
      <Section
        flex="1 1 auto"
        overflow="hidden"
        padding={isMobile ? '0 10px' : '0 20px'}
        margin="0 0px 10px 0px"
        flexDirection="column"
        justifyContent="start"
      >
        {chatId && chatViewList && (
          <ChatViewList
            chatFilterList={chatFilterList}
            limit={limit}
            chatId={chatId}
          />
        )}
      </Section>
      {/* )} */}
      {(!signer && !account && !isConnected) && (
        <Section flex="0 1 auto">
          <Span>
            You need to either pass signer or isConnected  to send
            messages{' '}
          </Span>
        </Section>
      )}
      {(messageInput && (!!signer || (!!account) || isConnected )) && (
        <Section flex="0 1 auto" position='static'>
          <MessageInput
            onVerificationFail={onVerificationFail}
            chatId={chatId}
            file={file}
            emoji={emoji}
            gif={gif}
            isConnected={isConnected}
            verificationFailModalBackground={verificationFailModalBackground}
            verificationFailModalPosition={verificationFailModalPosition}
            autoConnect = {autoConnect}
          />
        </Section>
      )}
      
    </Conatiner>
  );
};

//styles
const Conatiner = styled(Section)<IThemeProps>`
  border: ${(props) => props.theme.border?.chatViewComponent};
  backdrop-filter: ${(props) => props.theme.backdropFilter};
  box-sizing: border-box;
`;
