import { useState, ReactNode, useEffect } from 'react';
import { Constants, ENV } from '../config';
import {
  ChatDataContext,
  IChatDataContextValues,
} from '../context/chatContext';
import { ThemeContext } from '../components/chat/theme/ThemeProvider';
import useGetChatProfile from '../hooks/useGetChatProfile';
import { IUser } from '@pushprotocol/restapi';
import { IChatTheme, lightChatTheme } from '../components/chat/theme';

export interface IChatUIProviderProps {
  children: ReactNode;
  theme?: IChatTheme;
  account?: string | null;
  pgpPrivateKey?: string | null;
  env?: ENV;
}

export const ChatUIProvider = ({
  children,
  account = null,
  theme,
  pgpPrivateKey = null,
  env = Constants.ENV.PROD,
}: IChatUIProviderProps) => {
  const [accountVal, setAccountVal] = useState<string | null>(account);
  const [pushChatSocket, setPushChatSocket] = useState<any>(null);
  const [pgpPrivateKeyVal, setPgpPrivateKeyVal] =
    useState<string | null>(pgpPrivateKey);
  const [envVal, setEnvVal] = useState<ENV>(env);
  const {fetchChatProfile} = useGetChatProfile();
  const [connectedProfile,setConnectedProfile]=useState<IUser | undefined>(undefined);

  const [isPushChatSocketConnected, setIsPushChatSocketConnected] =
  useState<boolean>(false);
 

  useEffect(() => {
    resetStates();
    setEnvVal(env);
    setAccountVal(account);
    setPgpPrivateKeyVal(pgpPrivateKey);
  }, [env,account,pgpPrivateKey])

  useEffect(() => {
    setAccountVal(account)
  }, [account])



const resetStates = () => {
  setPushChatSocket(null);
  setIsPushChatSocketConnected(false);
  
};

useEffect(() => {
    (async () => {
      let user;
      if (account) {
        user = await fetchChatProfile({ profileId: account,env });

        if (user) setConnectedProfile(user);
      }
    })();
  }, [account,env]);

  const value: IChatDataContextValues = {
    account: accountVal,
    setAccount: setAccountVal,
    pgpPrivateKey: pgpPrivateKeyVal,
    setPgpPrivateKey: setPgpPrivateKeyVal,
    env: envVal,
    setEnv: setEnvVal,
    pushChatSocket,
    setPushChatSocket,
    isPushChatSocketConnected,
    setIsPushChatSocketConnected,
    connectedProfile,
    setConnectedProfile
  };


  const PROVIDER_THEME = Object.assign({}, lightChatTheme, theme);
console.log(PROVIDER_THEME)
  return (
    <ThemeContext.Provider value={PROVIDER_THEME}>
      <ChatDataContext.Provider value={value}>
        {children}
      </ChatDataContext.Provider>
    </ThemeContext.Provider>
  );
};
