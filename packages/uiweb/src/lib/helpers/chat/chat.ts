import * as PushAPI from '@pushprotocol/restapi';
import type { ENV } from '../../config';
import { Constants } from '../../config';
import type { AccountEnvOptionsType, IMessageIPFS } from '../../types';
import { ChatFeedsType } from '../../types';
import type { Env, IConnectedUser, IFeeds, IUser } from '@pushprotocol/restapi';
import { walletToPCAIP10 } from '../address';
import { getData } from './localStorage';

type HandleOnChatIconClickProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

type GetChatsType = {
  pgpPrivateKey: string;
  supportAddress: string;
  limit: number;
  threadHash?: string;
  env?:  Env;
  account: string;
}



export const handleOnChatIconClick = ({
  isModalOpen,
  setIsModalOpen,
}: HandleOnChatIconClickProps) => {
  setIsModalOpen(!isModalOpen);
};

export const createUserIfNecessary = async (
  options: AccountEnvOptionsType
): Promise<IConnectedUser> => {
  const { account, signer, env = Constants.ENV.PROD } = options || {};
  let connectedUser = await PushAPI.user.get({ account: account, env });
  if (!connectedUser?.encryptedPrivateKey) {
    connectedUser = await PushAPI.user.create({ account: account, signer: signer, env });
  }
  const decryptedPrivateKey = await PushAPI.chat.decryptPGPKey({
    encryptedPGPPrivateKey: connectedUser.encryptedPrivateKey,
    account,
    signer,
    env
  });
  return { ...connectedUser, privateKey: decryptedPrivateKey };
};

type GetChatsResponseType = {
  chatsResponse: IMessageIPFS[];
  lastThreadHash: string | null;
  lastListPresent: boolean;
};

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
      toDecrypt:true,
      limit: limit,
      env,
    });

    const lastThreadHash = chats[chats.length - 1]?.link;
    const lastListPresent = chats.length > 0 ? true : false;
    return { chatsResponse: chats, lastThreadHash, lastListPresent };
  }
  return { chatsResponse: [], lastThreadHash: null, lastListPresent: false };
};

type DecrypteChatType = {
  message: IMessageIPFS,
  connectedUser: IConnectedUser,
  env:  ENV
}
export const decryptChat = async (
  options: DecrypteChatType
):Promise<IMessageIPFS> => {
  const {
    message,
    connectedUser,
    env = Constants.ENV.PROD,
  } = options || {};
  const decryptedChat:IMessageIPFS[] = await PushAPI.chat.decryptConversation({
    messages: [message],
    connectedUser,
    pgpPrivateKey: connectedUser.privateKey!,
    env,
  });
  return decryptedChat[0];
};

export const copyToClipboard = (address: string): void => {
  if (navigator && navigator.clipboard) {
    navigator.clipboard.writeText(address);
  } else {
    const el = document.createElement('textarea');
    el.value = address;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
};


export const getDefaultFeedObject = ({user}:{user:IUser}):IFeeds => {
  const feed = {
    msg: {
      messageContent: '',
      timestamp: 0,
      messageType: '',
      signature: '',
      sigType: '',
      link: null,
      encType: '',
      encryptedSecret: '',
      fromDID: '',
      fromCAIP10: '',
      toDID: '',
      toCAIP10: '',
    },
    wallets:  user.wallets,
    did: user.did,
    threadhash: null,
    profilePicture: user?.profile?.picture,
    name: null,
    about: user.about,
    intent: null,
    intentSentBy: null,
    intentTimestamp: new Date(),
    publicKey:  user.publicKey,
    combinedDID: '',
    cid: '',
    groupInformation: undefined,
  };
  return feed;
}

type CheckIfIntentType = {
 chat:IFeeds,
 account:string,
}
export const checkIfIntent = ({chat,account}:CheckIfIntentType):boolean => {
  if(Object.keys(chat || {}).length && (chat.combinedDID.toLowerCase()).includes(walletToPCAIP10(account).toLowerCase()))
  {
    if( chat.intent && (chat.intent.toLowerCase()).includes(walletToPCAIP10(account).toLowerCase()))
    return false;
    else
    return true;
  }
  return false;
} 

export const checkIfUnread = (chatId:string,chat:IFeeds):boolean => {
  const tempChat = getData(chatId);
  if(tempChat && tempChat?.msg && (tempChat.msg.timestamp!) < (chat.msg.timestamp!))
   return true;
  return false;
}

