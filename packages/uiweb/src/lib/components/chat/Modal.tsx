import React, { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ChatInput } from './ChatInput';
import { ModalHeader } from './ModalHeader';
import { AddressInfo } from './AddressInfo';
import PoweredByPushLogo from '../../icons/chat/sponsorPush.svg';
import { ReactComponent as HandWave } from '../../icons/chat/handWave.svg';
import { ChatMainStateContext, ChatPropsContext } from '../../context';
import { Chats } from './Chats';
import {
  createUserIfNecessary,
  getChats,
  walletToPCAIP10,
} from '../../helpers';
import { IMessageIPFS } from '../../types';
import { useChatScroll } from '../../hooks';
import { Spinner } from './Spinner';
import { Toaster } from './Toaster';

const chatsFetchedLimit = 10;

export const Modal: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [lastThreadHashFetched, setLastThreadHashFetched] = useState<
    string | null
  >(null);
  const [wasLastListPresent, setWasLastListPresent] = useState<boolean>(false);
  const { supportAddress, env, account, greetingMsg, theme } =
    useContext<any>(ChatPropsContext);
  const {
    chats,
    setChatsSorted,
    connectedUser,
    setConnectedUser,
    toastMessage,
    toastType,
    setToastMessage,
    setToastType,
  } = useContext<any>(ChatMainStateContext);
  const listInnerRef = useChatScroll(chats.length);

  const greetingMsgObject = {
    fromDID: walletToPCAIP10(supportAddress),
    toDID: walletToPCAIP10(account),
    fromCAIP10: walletToPCAIP10(supportAddress),
    toCAIP10: walletToPCAIP10(account),
    messageContent: greetingMsg,
    messageType: 'Text',
    signature: '',
    encType: '',
    encryptedSecret: '',
    sigType: '',
    link: null,
    timestamp: undefined,
    icon: HandWave,
  };
  const onScroll = () => {
    if (listInnerRef.current) {
      const { scrollTop } = listInnerRef.current;
      if (scrollTop === 0) {
        // This will be triggered after hitting the first element.
        // pagination
        getChatCall();
      }
    }
  };

  const getChatCall = async () => {
    if (!connectedUser) return;
    if (wasLastListPresent && !lastThreadHashFetched) return;
    setLoading(true);
    const { chatsResponse, lastThreadHash, lastListPresent } = await getChats({
      account,
      pgpPrivateKey: connectedUser.privateKey,
      supportAddress,
      threadHash: lastThreadHashFetched!,
      limit: chatsFetchedLimit,
      env,
    });
    setChatsSorted([...chats, ...chatsResponse]);
    setLastThreadHashFetched(lastThreadHash);
    setWasLastListPresent(lastListPresent);
    setLoading(false);
  };

  const connectUser = async () => {
    setLoading(true);
    try {
      const user = await createUserIfNecessary({ account, env });
      setConnectedUser(user);
      setLoading(false);
    } catch (err) {
      setToastMessage(err);
      setToastType('error');
      setLoading(false);
    }
  };

  useEffect(() => {
    getChatCall();
  }, [connectedUser]);

  return (
    <Container theme={theme}>
      <HeaderSection>
        <ModalHeader />
        <AddressInfo />
      </HeaderSection>
      {!connectedUser && (
        <Chats
          msg={greetingMsgObject}
          caip10={walletToPCAIP10(account)}
          messageBeingSent={true}
        />
      )}
      {loading && <Spinner size="40" />}
      <ChatSection ref={listInnerRef} onScroll={onScroll} theme={theme}>
        {connectedUser && chats.length ? (
          chats.map((chat: IMessageIPFS, index: number) => (
            <Chats
              msg={chat}
              key={index}
              caip10={walletToPCAIP10(account)}
              messageBeingSent={true}
            />
          ))
        ) : (
          <></>
        )}
      </ChatSection>
      {!connectedUser && !loading && (
        <ConnectSection>
          <Button onClick={() => connectUser()} theme={theme}>
            Connect
          </Button>
          <Span>Connect your wallet to continue</Span>
        </ConnectSection>
      )}
      {toastMessage && <Toaster message={toastMessage} type={toastType}/>}

      <InputSection>
        {connectedUser && <ChatInput />}
        <Image
          src={PoweredByPushLogo}
          alt="Powered by Push Protocol"
          height="18px"
          width="145px"
        />
      </InputSection>
    </Container>
  );
};

//styles
const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  background: ${(props) => props.theme.moduleColor};
  border: ${(props) => props.theme.border};
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.07);
  border-radius: ${(props) => props.theme.borderRadius};
  height: 585px;
  max-height: 585px;
  width: 350px;
  max-width: 350px;
  padding: 0 15px 9px 15px;
`;

const ChatSection = styled.div`
  height: 350px;
  overflow: auto;
  padding: 0 5px;

  /* width */
  &::-webkit-scrollbar {
    width: 5px;
  }

  /* Track */
  &::-webkit-scrollbar-track {
    border-radius: 20px;
    margin: 0 0 0 4px;
  }

  /* Handle */
  &::-webkit-scrollbar-thumb {
    background: ${(props: any): string => props.theme.bgColorSecondary};
    border-radius: 20px;
  }
`;
const ConnectSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 30%;
`;

const Button = styled.button`
  background: ${(props) => props.theme.btnColorPrimary};
  border-radius: 15px;
  align-self: center;
  padding: 11px 36px;
  border: none;
  font-weight: 500;
  font-size: 17px;
  line-height: 150%;
  display: flex;
  align-items: center;
  text-align: center;
  letter-spacing: -0.019em;
  color: ${(props) => props.theme.textColorSecondary};
  margin-bottom: 10px;
  cursor: pointer;
`;

const HeaderSection = styled.div``;

const InputSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const Image = styled.img`
  display: flex;
  max-height: initial;
  vertical-align: middle;
  overflow: initial;
  cursor: pointer;
  height: ${(props: any): string => props.height || '24px'};
  width: ${(props: any): string => props.width || '20px'};
  align-self: center;
`;

const Span = styled.span`
  font-weight: 400;
  font-size: 15px;
  line-height: 140%;
  display: flex;
  text-align: center;
  justify-content: center;
  margin-bottom: 30%;
  color: #657795;
`;
