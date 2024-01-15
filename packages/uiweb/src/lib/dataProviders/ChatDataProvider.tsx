import { useState, ReactNode, useEffect } from 'react';
import { Constants, ENV, GUEST_MODE_ACCOUNT } from '../config';
import {
  ChatDataContext,
  IChatDataContextValues,
} from '../context/chatContext';
import { ThemeContext } from '../components/chat/theme/ThemeProvider';
import { PushAPI, SignerType } from '@pushprotocol/restapi';
import { IChatTheme, lightChatTheme } from '../components/chat/theme';
import { getAddressFromSigner, pCAIP10ToWallet } from '../helpers';
import useInitializePushUser from '../hooks/chat/useInitializePushUser';
import useChatProfile from '../hooks/chat/useChatProfile';

export interface IChatUIProviderProps {
  children: ReactNode;
  theme?: IChatTheme;
  account?: string | null;
  signer?: SignerType | undefined;
  pushUser?: PushAPI | undefined;
  env?: ENV;
}

export const ChatUIProvider = ({
  children,
  account = undefined,
  pushUser = undefined,
  theme,
  signer = undefined,
  env = Constants.ENV.PROD,
}: IChatUIProviderProps) => {
  const [accountVal, setAccountVal] = useState<string | null>(pCAIP10ToWallet(account!));
  const [pushChatStream, setPushChatStream] = useState<any>(null);
  const [signerVal, setSignerVal] = useState<SignerType | undefined>(signer);
  const [pushUserVal, setPushUserVal] = useState<PushAPI |undefined>(pushUser);
  const [envVal, setEnvVal] = useState<ENV>(env);
  const { initializePushUser } = useInitializePushUser();

  const {fetchChatProfile} = useChatProfile();

  const [isPushChatStreamConnected, setIsPushChatStreamConnected] =
    useState<boolean>(false);
  useEffect(() => {
    (async () => {
      resetStates();
      setEnvVal(env);

      if (Object.keys(signer ||{}).length && !pushUser) {
     
          const address = await getAddressFromSigner(signer!);
          setAccountVal(address);
     
      }

      else if(!signer && pushUser){
        const profile = await fetchChatProfile({});
        setAccountVal(profile?.wallets);

      }
      else{
        setAccountVal(GUEST_MODE_ACCOUNT);

      }
      
      setSignerVal(signer);
      setPushUserVal(pushUser);
    })()

  }, [env, account, signer,pushUser])

  useEffect(() => {
    
      (async() => {

        if(accountVal && envVal && !pushUserVal){
          const pushUser = await initializePushUser({signer: signerVal, account: accountVal!,env:envVal});
          setPushUserVal(pushUser);
        }
         
   
      })();
  }, [signerVal, accountVal, envVal])

  const resetStates = () => {
    setPushChatStream(null);
    setIsPushChatStreamConnected(false);

  };



  const value: IChatDataContextValues = {
    account: accountVal,
    signer: signerVal,
    setSigner: setSignerVal,
    setAccount: setAccountVal,
    env: envVal,
    setEnv: setEnvVal,
    pushChatStream,
    setPushChatStream,
    isPushChatStreamConnected,
    setIsPushChatStreamConnected,
    pushUser:pushUserVal,
    setPushUser:setPushUserVal

  };


  const PROVIDER_THEME = Object.assign({}, lightChatTheme, theme);
  return (
    <ThemeContext.Provider value={PROVIDER_THEME}>
      <ChatDataContext.Provider value={value}>
        {children}
      </ChatDataContext.Provider>
    </ThemeContext.Provider>
  );
};