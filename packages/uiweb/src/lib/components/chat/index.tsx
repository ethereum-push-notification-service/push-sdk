import React, { useEffect, useState } from 'react';
import ChatIcon from '../../icons/chat/chatIcon.svg';
import { Modal } from './Modal';
import styled from 'styled-components';
import { handleOnChatIconClick, walletToPCAIP10 } from '../../helpers';
import { ChatMainStateContext, ChatPropsContext } from '../../context';
import { IMessageIPFS, ITheme } from '../../types';
import HandWave from '../icons/chat/handWave.svg';
import './index.css';
import { Constants, lightTheme } from '../../config';

export { lightTheme } from '../../config';
export { ITheme } from '../../types';

export type ChatProps = {
  account: string;
  supportAddress: string;
  greetingMsg?: string;
  modalTitle?: string;
  theme?: ITheme;
  apiKey?: string;
  env?: string;
};

export type ButtonStyleProps = {
  bgColor: string;
};

export const Chat: React.FC<ChatProps> = ({
  account,
  supportAddress,
  greetingMsg = Constants.DEFAULT_GREETING_MSG,
  modalTitle = Constants.DEFAULT_TITLE,
  theme = { ...lightTheme },
  apiKey = '',
  env = Constants.ENV.PROD,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [connectedUser, setConnectedUser] = useState<any>(null);
  const [messageBeingSent, setMessageBeingSent] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'error' | 'success'>();
  const [chats, setChats] = useState<IMessageIPFS[]>([]);

  const setChatsSorted = (chats: IMessageIPFS[]) => {
    chats.sort((a, b) => {
      return a.timestamp! > b.timestamp! ? 1 : -1;
    });
    setChats(chats);
  };

  const chatPropsData = {
    account,
    supportAddress,
    greetingMsg,
    modalTitle,
    theme: { ...lightTheme, ...theme },
    apiKey,
    env,
  };

  useEffect(() => {
    setChats([]);
    setConnectedUser(null);
  }, [account, supportAddress]);

  const chatMainStateData = {
    isModalOpen,
    setIsModalOpen,
    connectedUser,
    setConnectedUser,
    messageBeingSent,
    setMessageBeingSent,
    setToastMessage,
    setToastType,
    message,
    setMessage,
    chats,
    setChatsSorted,
    toastMessage,
    toastType,
  };

  return (
    <Container>
      <ChatPropsContext.Provider value={chatPropsData}>
        <ChatMainStateContext.Provider value={chatMainStateData}>
          {!isModalOpen && (
            <Button
              bgColor={theme.btnColorPrimary!}
              onClick={() =>
                handleOnChatIconClick({ isModalOpen, setIsModalOpen })
              }
            >
              <Image src={ChatIcon} alt="chat" />
            </Button>
          )}
          {isModalOpen && <Modal />}
        </ChatMainStateContext.Provider>
      </ChatPropsContext.Provider>
    </Container>
  );
};

//styles

const Container = styled.div`
  font-family: 'Strawford';
  flex: 1;
  display: flex;
  position: fixed;
  bottom: 0;
  right: 0;
  width: fit-content;
  margin: 0 3rem 2rem 0;
  align-items: center;
  justify-content: center;
`;

const Button = styled.button<ButtonStyleProps>`
  background: ${(props) => props.bgColor};
  border: none;
  cursor: pointer;
  border-radius: 18px;
  padding: 16.5px 16.5px 13px 18.5px;
`;

const Image = styled.img``;
