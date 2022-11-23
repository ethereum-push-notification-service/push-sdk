import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import * as PushAPI from '@pushprotocol/restapi';
import Constants from '../components/chat/constants';
import { AccountEnvOptionsType } from '../types';
import { IConnectedUser, IMessageIPFS } from '@pushprotocol/restapi';

type HandleOnChatIconClickProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

type GetChatsType = {
  pgpPrivateKey: string;
  receiverAddress: string;
} & AccountEnvOptionsType;
export const handleOnChatIconClick = ({
  isModalOpen,
  setIsModalOpen,
}: HandleOnChatIconClickProps) => {
  console.log(isModalOpen);
  setIsModalOpen(!isModalOpen);
};

export const walletToPCAIP10 = (account: string): string => {
  if (account.includes('eip155:')) {
    return account;
  }
  return 'eip155:' + account;
};

export const pCAIP10ToWallet = (wallet: string): string => {
  wallet = wallet.replace('eip155:', '');
  return wallet;
};

export const resolveEns = (address: string, provider: Web3Provider) => {
  const walletLowercase = pCAIP10ToWallet(address).toLowerCase();
  const checksumWallet = ethers.utils.getAddress(walletLowercase);
  // let provider = ethers.getDefaultProvider('mainnet');
  // if (
  //   window.location.hostname == 'app.push.org' ||
  //   window.location.hostname == 'staging.push.org' ||
  //   window.location.hostname == 'dev.push.org' ||
  //   window.location.hostname == 'alpha.push.org' ||
  //   window.location.hostname == 'w2w.push.org'
  // ) {
  //   provider = new ethers.providers.InfuraProvider(
  //     'mainnet',
  //     appConfig.infuraAPIKey
  //   );
  // }

  console.log(provider);

  provider.lookupAddress(checksumWallet).then((ens) => {
    if (ens) {
      return ens;
    } else {
      return null;
    }
  });
};

export const createUserIfNecessary = async (
  options: AccountEnvOptionsType
): Promise<IConnectedUser> => {
  const { account, env = Constants.ENV.PROD } = options || {};
  let connectedUser = await PushAPI.user.get({ account: account, env });
  if (!connectedUser?.encryptedPrivateKey) {
    connectedUser = await PushAPI.user.create({ account: account, env });
  }
  const decryptedPrivateKey = await PushAPI.chat.decryptWithWalletRPCMethod(
    connectedUser.encryptedPrivateKey,
    account
  );
  return { ...connectedUser, privateKey: decryptedPrivateKey };
};

export const getChats = async (
  options: GetChatsType
): Promise<IMessageIPFS[]> => {
  const {
    account,
    pgpPrivateKey,
    receiverAddress,
    env = Constants.ENV.PROD,
  } = options || {};
  const threadhash: any = await PushAPI.chat.conversationHash({
    account: account,
    conversationId: receiverAddress,
    env,
  });
  if (threadhash.threadHash) {
    const chats = await PushAPI.chat.history({
      account: account,
      pgpPrivateKey: pgpPrivateKey,
      threadhash: threadhash.threadHash,
      limit: 30,
      env,
    });

    console.log(chats);
    return chats;
  }
  return [];
};
