import React, { useEffect, useState } from 'react';
import ChatIcon from '../../icons/chat/chatIcon.svg';
import { Modal } from './Modal';
import Constants from './constants';
import * as PushAPI from '@pushprotocol/restapi';
import styled from 'styled-components';
import { handleOnChatIconClick } from '../../helpers';
import { ChatMainStateContext, ChatPropsContext } from '../../context';
import { IMessageIPFS } from '@pushprotocol/restapi';

export type ChatProps = {
  account: string;
  supportAddress: string;
  greetingMsg?: string;
  modalTitle?: string;
  primaryColor?: string;
  apiKey?:string;
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
  primaryColor = Constants.COLOR.PRIMARY,
  apiKey = '',
  env = Constants.ENV.PROD,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [connectedUser, setConnectedUser] = useState<any>(null);
  const [messageBeingSent, setMessageBeingSent] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [footerError, setFooterError] = useState<string>('');
  const [chats, setChats] = useState<IMessageIPFS[]>([]);

  const setChatsSorted = (chats: IMessageIPFS[]) => {
    chats.sort((a, b) => {
      return (a.timestamp! > b.timestamp!) ? 1 : -1;
    });
    setChats(chats);
  }

  const chatPropsData = {
    account,
    supportAddress,
    greetingMsg,
    modalTitle,
    primaryColor,
    apiKey,
    env
  }

  const chatMainStateData = {
    isModalOpen,
    setIsModalOpen,
    connectedUser,
    setConnectedUser,
    messageBeingSent, 
    setMessageBeingSent,
    message,
    setMessage,
    chats,
    setChatsSorted,
    footerError,
    setFooterError
  }

  return (
    <Container>
      <ChatPropsContext.Provider value={chatPropsData}>
        <ChatMainStateContext.Provider value={chatMainStateData}>
          {!isModalOpen && (
            <Button bgColor={primaryColor} onClick={() => handleOnChatIconClick({isModalOpen, setIsModalOpen})}>
              <Image src={ChatIcon} alt="chat" />
            </Button>
          )}
          {isModalOpen && (
            <Modal />
          )}
        </ChatMainStateContext.Provider>
      </ChatPropsContext.Provider>
    </Container>
  );
};

//styles
const Container = styled.div`
  font-family: 'Source Sans Pro', Arial, sans-serif;
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
