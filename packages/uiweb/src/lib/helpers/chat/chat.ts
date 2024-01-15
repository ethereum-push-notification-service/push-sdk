// import * as PushAPI from '@pushprotocol/restapi';
import type { ENV } from '../../config';
import { Constants } from '../../config';
import type { 
  AccountEnvOptionsType,
  Messagetype,
} from '../../types';
import type { Env,  IConnectedUser, IFeeds, IMessageIPFS, IUser } from '@pushprotocol/restapi';
import { isPCAIP, pCAIP10ToWallet, walletToPCAIP10 } from '../address';
import { getData } from './localStorage';
import { ethers } from 'ethers';
import { PushAPI } from '@pushprotocol/restapi';
import { Group } from '../../components';
type HandleOnChatIconClickProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};




type GetChatsType = {
  pgpPrivateKey?: string;
  supportAddress: string;
  pushUser: PushAPI;
  limit: number;
  threadHash?: string;
  env?: Env;
  account: string;
};

export const handleOnChatIconClick = ({
  isModalOpen,
  setIsModalOpen,
}: HandleOnChatIconClickProps) => {
  setIsModalOpen(!isModalOpen);
};

export const createUserIfNecessary = async (
  options: AccountEnvOptionsType
): Promise<IConnectedUser | undefined> => {
  const { pushUser } = options || {};
  let connectedUser:IUser;
  if (Object.keys(pushUser || {}).length) {
    connectedUser = await pushUser.info();
    return { ...connectedUser, 
      privateKey: connectedUser!.encryptedPrivateKey,
     };
  }
  return;

 
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
    supportAddress,
    pushUser,
    threadHash = null,
    limit = 40,
    env = Constants.ENV.PROD,
  } = options || {};
  

  const chats = await pushUser?.chat.history(
    supportAddress,
    {limit}
   );

    const lastThreadHash = chats[chats.length - 1]?.link;
    const lastListPresent = chats.length > 0 ? true : false;
    return { chatsResponse: chats, lastThreadHash, lastListPresent };
  
};

type DecrypteChatType = {
  message: IMessageIPFS;
  connectedUser: IConnectedUser;
  env: ENV;
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

export const getDefaultFeedObject = ({
  user,
  groupInformation,
}: {
  user?: IUser;
  groupInformation?: Group;
}): IFeeds => {
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
    wallets: groupInformation ? null : user!.wallets,
    did: groupInformation ? null : user!.did,
    threadhash: null,
    profilePicture: groupInformation
      ? groupInformation.groupImage
      : user?.profile.picture,
    name: null,
    about: groupInformation ? null : user!.about,
    intent: null,
    intentSentBy: null,
    intentTimestamp: new Date(),
    publicKey: groupInformation ? null : user!.publicKey,
    combinedDID: '',
    cid: '',
    groupInformation: groupInformation ?? undefined,
  };
  return feed as IFeeds;
};

type CheckIfIntentType = {
  chat: IFeeds;
  account: string;
};
export const checkIfIntent = ({
  chat,
  account,
}: CheckIfIntentType): boolean => {
  if (account) {
    if (
      Object.keys(chat || {}).length &&
      chat.combinedDID
        .toLowerCase()
        .includes(walletToPCAIP10(account).toLowerCase())
    ) {
      if (
        chat.intent &&
        chat.intent
          .toLowerCase()
          .includes(walletToPCAIP10(account).toLowerCase())
      )
        return false;
      else return true;
    }
  }

  return false;
};

export const checkIfUnread = (chatId: string, chat: IFeeds): boolean => {
  const tempChat = getData(chatId);
  if (
    tempChat &&
    tempChat?.msg &&
    tempChat.msg.timestamp! < chat.msg.timestamp!
  )
    return true;
  return false;
};

export const getChatId = ({
  msg,
  account,
}: {
  msg: IMessageIPFS;
  account: string;
}) => {
  if (pCAIP10ToWallet(msg.fromCAIP10).toLowerCase() === account.toLowerCase()) {
    return msg.toCAIP10;
  }
  return !isPCAIP(msg.toCAIP10) ? msg.toCAIP10 : msg.fromCAIP10;
};

export const appendUniqueMessages = (
  parentList: Messagetype,
  newlist: IMessageIPFS[],
  infront: boolean
) => {
  const uniqueMap: { [timestamp: number]: IMessageIPFS } = {};
  const appendedArray = infront
    ? [...newlist, ...parentList.messages]
    : [...parentList.messages, ...newlist];
  const newMessageList = Object.values(
    appendedArray.reduce((uniqueMap, message) => {
      if (message.timestamp && !uniqueMap[message.timestamp]) {
        uniqueMap[message.timestamp] = message;
      }
      return uniqueMap;
    }, uniqueMap)
  );
  return newMessageList;
};

export const checkIfSameChat = (
  msg: IMessageIPFS,
  account: string,
  chatId: string
) => {
  if (ethers.utils.isAddress(chatId)) {
    chatId = walletToPCAIP10(chatId);
    if (
      Object.keys(msg || {}).length &&
      (((chatId.toLowerCase() === (msg.fromCAIP10?.toLowerCase())) &&
       ( walletToPCAIP10(account!).toLowerCase() ===
          msg.toCAIP10?.toLowerCase())) ||
        ((chatId.toLowerCase() === (msg.toCAIP10?.toLowerCase())) &&
          (walletToPCAIP10(account!).toLowerCase() ===
            msg.fromCAIP10?.toLowerCase())))
    ) {
      return true;
    }
  } else {
    if (
      Object.keys(msg || {}).length &&
      (chatId.toLowerCase() === msg.toCAIP10?.toLowerCase())
    ) {
      return true;
    }
  }


  return false;
};
