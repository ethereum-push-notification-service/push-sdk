import { IFeeds } from '@pushprotocol/restapi';
import { ThemeContext } from '../theme/ThemeProvider';
import { Dispatch, useContext } from 'react';
import { Section, Span, Spinner } from '../../reusables';
import useApproveChatRequest from '../../../hooks/chat/useApproveChatRequest';
import { useChatData } from '../../../hooks';
import styled from 'styled-components';
import { IChatTheme } from '../theme';
import { IThemeProps, IApproveRequestBubbleProps } from '../../../types';

export const ApproveRequestBubble = ({
  chatFeed,
  chatId,
  setChatFeed,
}: IApproveRequestBubbleProps) => {
  const { pgpPrivateKey } = useChatData();

  const ApproveRequestText = {
    GROUP: `You were invited to the group ${chatFeed?.groupInformation?.groupName}. Please accept to continue messaging in this group.`,
    W2W: ` Please accept to enable push chat from this wallet`,
  };
  
  const theme = useContext(ThemeContext);
  const { approveChatRequest, loading: approveLoading } =
    useApproveChatRequest();

  const handleApproveChatRequest = async () => {
    try {
      if (!pgpPrivateKey) {
        return;
      }

      const response = await approveChatRequest({
        chatId,
      });
      if (response) {
        const updatedChatFeed = { ...(chatFeed as IFeeds) };
        updatedChatFeed.intent = response;

        setChatFeed(updatedChatFeed);
      }
    } catch (error_: Error | any) {
      console.log(error_.message);
    }
  };
  return (
    <Section
      color={theme.textColor?.chatReceivedBubbleText}
      gap="10px"
      background={theme.backgroundColor?.chatReceivedBubbleBackground}
      padding="8px 12px"
      margin="7px 0"
      borderRadius=" 0px 12px 12px 12px"
      alignSelf="start"
      justifyContent="start"
      maxWidth="600px"
      width='40%'
      minWidth="15%"
      position="relative"
      flexDirection="column"
    >
      <Span
        alignSelf="center"
        textAlign="left"
        fontSize={theme.fontSize?.chatReceivedBubbleText}
        fontWeight={theme.fontWeight?.chatReceivedBubbleText}
        color={theme.textColor?.chatReceivedBubbleText}
        lineHeight="24px"
      >
        {chatFeed?.groupInformation
          ? ApproveRequestText.GROUP
          : ApproveRequestText.W2W}
      </Span>
      <Button
        theme={theme}
        onClick={() => (!approveLoading ? handleApproveChatRequest() : null)}
      >
        {approveLoading ? <Spinner color="#fff" size="24" /> : 'Accept'}
      </Button>
     
    </Section>
  );
};

//styles
const Button = styled.button<IThemeProps>`
  border: none;
  cursor: pointer;
  border-radius: 8px;
  background: ${(props) => props.theme.backgroundColor!.buttonBackground};
  border: none;
  color:  ${(props) => props.theme.textColor!.buttonText};
  width: 100%;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  max-height: 48px;
  min-height: 48px;
  padding: 0px 24px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
