import { useState, ReactNode, useEffect } from 'react';
import { Constants, ENV, GUEST_MODE_ACCOUNT } from '../config';
import {
  ChatDataContext,
  IChatDataContextValues,
} from '../context/chatContext';
import { ThemeContext } from '../components/chat/theme/ThemeProvider';
import useGetChatProfile from '../hooks/useGetChatProfile';
import { IUser, PushAPI, SignerType } from '@pushprotocol/restapi';
import { IChatTheme, lightChatTheme } from '../components/chat/theme';
import { getAddressFromSigner, pCAIP10ToWallet } from '../helpers';
import useCreateChatProfile from '../hooks/useCreateChatProfile';
import useDecryptPGPKey from '../hooks/useDecryptPGPKey';
import useInitializePushUser from '../hooks/useInitializeUser';
import useInitializeUser from '../hooks/useInitializeUser';
import useChatProfile from '../hooks/chat/useChatProfile';
import { IChatUIProviderProps } from '../types';
import usePushUserInfoUtilities from '../hooks/chat/useUserInfoUtilities';
import useUserProfile from '../hooks/useUserProfile';

export const ChatUIProvider = ({
  children,
  account = undefined,
  user = undefined,
  theme,
  pgpPrivateKey = null,
  signer = undefined,
  env = Constants.ENV.PROD,
}: IChatUIProviderProps) => {
  const [accountVal, setAccountVal] = useState<string | null>(
    pCAIP10ToWallet(account!)
  );
  const [pushChatSocket, setPushChatSocket] = useState<any>(null);
  const [signerVal, setSignerVal] = useState<SignerType | undefined>(signer);
  const [pushChatStream, setPushChatStream] = useState<any>(null);
  const [userVal, setUserVal] = useState<PushAPI | undefined>(user);

  const [pgpPrivateKeyVal, setPgpPrivateKeyVal] = useState<string | null>(
    pgpPrivateKey
  );
  const [envVal, setEnvVal] = useState<ENV>(env);
  const [connectedProfile, setConnectedProfile] = useState<IUser | undefined>(
    undefined
  );

  const [isPushChatSocketConnected, setIsPushChatSocketConnected] =
    useState<boolean>(false);
  const { fetchEncryptionInfo } = usePushUserInfoUtilities();
  const { initializeUser } = useInitializeUser();
  const { fetchUserProfile } = useUserProfile();

  const [isPushChatStreamConnected, setIsPushChatStreamConnected] =
    useState<boolean>(false);
  useEffect(() => {
    (async () => {
      resetStates();
  
      let address = null;
      if (Object.keys(signer || {}).length && !user) {
         address = await getAddressFromSigner(signer!);
      } else if (!signer && user) {
        const profile = await fetchUserProfile({user});
        if(profile)
        address = (pCAIP10ToWallet(profile?.wallets));
      } 
     

      setEnvVal(env);
      setAccountVal(address || GUEST_MODE_ACCOUNT);
      setSignerVal(signer);
    
      setUserVal(user);
      setPgpPrivateKeyVal(pgpPrivateKey);
    })();
  }, [env, account, signer, pgpPrivateKey,user]);
  
  useEffect(() => {
    (async () => {

      if ((accountVal && envVal ) ) {
        const pushUser = await initializeUser({
          signer: signerVal,
          account: accountVal!,
          env: envVal,
        });
        setUserVal(pushUser);
      }
    })();
  }, [signerVal, accountVal, envVal]);
  useEffect(() => {
    (async () => {
      if (userVal && !userVal?.readmode()&& !pgpPrivateKeyVal) {
        const encryptionInfo = await fetchEncryptionInfo({user:userVal});
        if (encryptionInfo)
          setPgpPrivateKeyVal(encryptionInfo.decryptedPgpPrivateKey);
      }
    })();
  }, [userVal]);

  const resetStates = () => {
    setPushChatSocket(null);
    setIsPushChatSocketConnected(false);
    setPushChatStream(null);
    setIsPushChatStreamConnected(false);
  };

  useEffect(() => {
    (async () => {
      let user;
      if (account) {
        user = await fetchUserProfile({ profileId: account, env,user });
        if (user) setConnectedProfile(user);
      }
    })();
  }, [account, env, pgpPrivateKey]);

  const value: IChatDataContextValues = {
    account: accountVal,
    signer: signerVal,
    setSigner: setSignerVal,
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
    setConnectedProfile,
    pushChatStream,
    setPushChatStream,
    isPushChatStreamConnected,
    setIsPushChatStreamConnected,
    user: userVal,
    setUser: setUserVal,
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
