import { useContext, useEffect, useState } from 'react';

import styled from 'styled-components';
import { Signer, ethers } from 'ethers';

import { useAccount, useChatData } from '../../../hooks';
import { ThemeContext } from '../theme/ThemeProvider';
import useGetChatProfile from '../../../hooks/useGetChatProfile';
import useCreateChatProfile from '../../../hooks/useCreateChatProfile';
import useDecryptPGPKey from '../../../hooks/useDecryptPGPKey';

import { getAddressFromSigner } from '../../../helpers';
import { IChatTheme } from '../theme';
import { device } from '../../../config';
import { walletToPCAIP10 } from '../../../helpers';
/**
 * @interface IThemeProps
 * this interface is used for defining the props for styled components
 */
interface IThemeProps {
  theme?: IChatTheme;
}
interface IConnectButtonProps {
  autoConnect?: boolean;
}

export const ConnectButtonSub = ({autoConnect = false})  => {
  const {wallet, connecting , connect, disconnect} = useAccount();

  const {
    signer,
    pgpPrivateKey,
    account,
    env,
    setPgpPrivateKey,
    setAccount,
    setSigner,
  } = useChatData();
  const theme = useContext(ThemeContext);
  const {fetchChatProfile} = useGetChatProfile();
  const {creteChatProfile} = useCreateChatProfile();
  const {decryptPGPKey} = useDecryptPGPKey();


  const setUserData = () => {
    if (wallet) {
      (async () => {
        const ethersProvider = new ethers.providers.Web3Provider(wallet.provider, 'any')
        const signer = ethersProvider.getSigner()
        const newAdd = await getAddressFromSigner(signer)
        setSigner(signer)
        setAccount(walletToPCAIP10(newAdd));
      })()
    } else if (!wallet) {
      setAccount('')
      setSigner(undefined)
      setPgpPrivateKey(null)
    }
  }
  useEffect(() => {
    if(wallet && !autoConnect)
    disconnect(wallet);
    setUserData()
  }, [wallet])

  useEffect(() => {
    (async () => {
      if (account && signer) {
        if (!pgpPrivateKey) await handleUserCreation();
      }
    })();
  }, [account, signer]);


  const handleUserCreation = async () => {
    if (!account && !env) return;
    try {
      let user  = await fetchChatProfile({ profileId: account! ,env});
      if (!user) {
        if (!signer) return;
        user = await creteChatProfile({ signer: signer ,env});
      }
      if (user?.encryptedPrivateKey && !pgpPrivateKey) {
        const decryptPgpKey = await decryptPGPKey({
          encryptedPrivateKey: user.encryptedPrivateKey,
          account: account!,
          signer: signer,
          env: env,
        });
        if(decryptPgpKey)
        setPgpPrivateKey(decryptPgpKey);
      }
    } catch (e: any) {
      console.log(e);
    }
  };
  return !signer ? (
    <ConnectButtonDiv theme={theme}>
      <button onClick={() => (wallet ? disconnect(wallet) : connect())}>{connecting ? 'connecting' : wallet ? 'disconnect' : 'Connect Wallet'}</button>
    </ConnectButtonDiv>
  ) : (
    <></>
  );
};

//styles
const ConnectButtonDiv = styled.div<IThemeProps>`
  width: fit-content;
 
  button{
    background: ${(props) => `${props.theme.backgroundColor.buttonBackground}!important`};
    color: ${(props) => `${props.theme.textColor.buttonText}!important`};
    text-align:center;
    font-size: 1em;
    cursor:pointer;
    border-radius: 10px;
    padding: 10px 20px;
    outline: none;
    border: none;
    cursor: pointer;
    font-weight: 600;
   
  }
  button:hover{
    scale: 1.05;
    transition: 0.3s;
  }
  @media ${device.mobileL} {
    font-size: 12px;
  }
  body.modal-open {
    overflow-y: hidden;
  }
`;