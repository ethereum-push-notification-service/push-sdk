import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import * as PushAPI from '@pushprotocol/restapi';
import {Constants} from '../config';
import { AccountEnvOptionsType, IMessageIPFS } from '../types';
import { IConnectedUser } from '@pushprotocol/restapi';

type HandleOnChatIconClickProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

type GetChatsType = {
  pgpPrivateKey: string;
  supportAddress: string;
  limit: number;
  threadHash?: string;
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

type GetChatsResponseType = {
  chatsResponse: IMessageIPFS[],
  lastThreadHash: string | null,
  lastListPresent: boolean
}

export const getChats = async (
  options: GetChatsType
): Promise<GetChatsResponseType> => {
  const {
    account,
    pgpPrivateKey,
    supportAddress,
    threadHash = null,
    limit = 40,
    env = Constants.ENV.PROD,
  } = options || {};
  let threadhash: any = threadHash;
  if (!threadhash) {
    threadhash = await PushAPI.chat.conversationHash({
      account: account,
      conversationId: supportAddress,
      env,
    });
    threadhash = threadhash.threadHash;
  }
  if (threadhash) {
    const chats = await PushAPI.chat.history({
      account: account,
      pgpPrivateKey: pgpPrivateKey,
      threadhash: threadhash,
      limit: limit,
      env,
    });

    const lastThreadHash = chats[chats.length - 1]?.link;
    const lastListPresent = chats.length > 0 ? true : false;
    console.log({ chats, lastThreadHash });
    return { chatsResponse: chats, lastThreadHash, lastListPresent };
  }
  return { chatsResponse: [], lastThreadHash: null, lastListPresent: false };
};


export const copyToClipboard = (address:string):void => {
  if (navigator && navigator.clipboard) {
    navigator.clipboard.writeText(address);
  } else {
    const el = document.createElement("textarea");
    el.value = address;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }
};