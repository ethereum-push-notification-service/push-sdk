import { Env } from '@pushprotocol/restapi';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { ethers } from 'ethers';
import { useMemo } from 'react';
import { CoreContractChainId, CoreRPC } from '../config';

interface useAccountParams {
  env:Env;
}
export const useAccount = ({env}:useAccountParams) => {
  const [{ wallet, connecting }, connect, disconnect, updateBalances, setWalletModules, setPrimaryWallet] =
    useConnectWallet();

  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain();

  const isActive = () => {
    return wallet && wallet.accounts.length > 0 ? true : false;
  };

  const switchChain = async (desiredChain: number) => {
    setChain({ chainId: ethers.utils.hexValue(desiredChain) });
  };
  const provider = useMemo(() => {
    return wallet ? new ethers.providers.Web3Provider(wallet.provider, 'any') : new ethers.providers.JsonRpcProvider(CoreRPC[env]);
  }, [wallet]);

  return {
    wallet,
    connecting,
    connect,
    disconnect,
    updateBalances,
    setWalletModules,
    setPrimaryWallet,
    provider,
    account: wallet && wallet.accounts.length > 0 ? ethers.utils.getAddress(wallet.accounts[0].address) : undefined,
    chainId: connectedChain ? Number(connectedChain.id) : CoreContractChainId[env],
    isActive,
    setChain,
    switchChain,
    settingChain,
    chains,
  };
};