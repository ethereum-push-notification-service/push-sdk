import React, { useContext, useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { Chat } from '@pushprotocol/uiweb';
import { Web3Context } from './context';

export type ChatProps = {
  provider: Web3Provider;
  supportAddress: string;
  greetingMsg?: string;
  modalTitle?: string;
  primaryColor?: string;
  env?: string;
};

export const ChatSupportTest = () => {
  const { account } = useContext<any>(Web3Context);
  return (
    <Chat
    account={account}
      supportAddress="0xd9c1CCAcD4B8a745e191b62BA3fcaD87229CB26d"
      env='dev'
    />
  );
};
