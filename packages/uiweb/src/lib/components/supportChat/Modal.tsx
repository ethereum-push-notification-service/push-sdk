import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ChatInput } from './ChatInput';
import { ModalHeader } from './ModalHeader';
import { AddressInfo } from './AddressInfo';
import PoweredByPushLogo from '../../icons/sponsorPush.svg';
import { SponserPushIcon } from '../../icons/SponserPush';
import { HandWaveSvg } from '../../icons/HandWaveSvg';
import { SupportChatMainStateContext, SupportChatPropsContext } from '../../context';
import { Chats } from './Chats';
import {
  createUserIfNecessary,
  getChats,
  walletToPCAIP10,
} from '../../helpers';
import { useChatScroll } from '../../hooks';
import { Spinner } from './spinner/Spinner';
import { Toaster } from './toaster/Toaster';
import { Div } from '../reusables/sharedStyling';
import { IMessageIPFS } from '@pushprotocol/restapi';

const chatsFetchedLimit = 10;

export const Modal: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [lastThreadHashFetched, setLastThreadHashFetched] = useState<
    string | null
  >(null);
  const [wasLastListPresent, setWasLastListPresent] = useState<boolean>(false);
  const { supportAddress, pushUser, env, account, signer, greetingMsg, theme } =
    useContext<any>(SupportChatPropsContext);
  const {
    chats,
    setChatsSorted,
    connectedUser,
    setConnectedUser,
    toastMessage,
    toastType,
    setToastMessage,
    setToastType,
    socketData
  } = useContext<any>(SupportChatMainStateContext);
  const listInnerRef = useChatScroll(0);

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
    icon: <HandWaveSvg fill={theme.btnColorPrimary}/>,
  };
  const onScroll = () => {
    if (listInnerRef.current) {
      const { scrollTop } = listInnerRef.current;
      if (scrollTop === 0) {
        const content = listInnerRef.current;
        const curScrollPos = content.scrollTop;
        const oldScroll = content.scrollHeight - content.clientHeight;

        getChatCall();

        const newScroll = content.scrollHeight - content.clientHeight;
        content.scrollTop = curScrollPos + (newScroll - oldScroll);
      }
    }
  };
  const scrollToBottom = () => {
    setTimeout(()=>{
      if (listInnerRef.current) {
        listInnerRef.current.scrollTop = listInnerRef.current.scrollHeight +100;

      }
    },0)
  
  };

  const getChatCall = async () => {
    if (!connectedUser) return;
    if (wasLastListPresent && !lastThreadHashFetched) return;
    setLoading(true);
    const { chatsResponse, lastThreadHash, lastListPresent } = await getChats({
      account,
      pushUser,
      // pgpPrivateKey: connectedUser.privateKey,
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
      if (!socketData.epnsSDKSocket?.connected) {
        socketData.epnsSDKSocket?.connect();
      }
      const user = await createUserIfNecessary({ account, signer, env, pushUser });
      setConnectedUser(user);
      setLoading(false);
    } catch (err:any) {
      setLoading(false);
      setToastMessage(err?.message);
      setToastType('error');
    }
  };

  
  useEffect(() => {

    if(socketData.messagesSinceLastConnection){
      const message: IMessageIPFS = socketData.messagesSinceLastConnection
      if (message ) {
        setChatsSorted([...chats, message]);
    }}
  }, [socketData.messagesSinceLastConnection]);

  useEffect(() => {
    
    getChatCall();
  }, [connectedUser, env, account,signer, supportAddress, pushUser]);

  useEffect(() => {
    scrollToBottom();
  }, [connectedUser, env, account, socketData]);


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
        <Div
         height="18px"
         width="145px"
      >
        <SponserPushIcon />
      </Div>
        
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
