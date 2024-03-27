import { Group, IChatPreviewPayload, IMessagePayload, User } from '../exportedTypes';
import { ethers } from 'ethers';
import { IFeeds, IMessageIPFSWithCID, IUser, ParticipantStatus } from '@pushprotocol/restapi';
import { getAddress, walletToPCAIP10 } from '../../../helpers';
import { Env,  } from '@pushprotocol/restapi';
import moment from 'moment';
import { ProfilePicture } from '../../../config';

export const profilePicture = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAvklEQVR4AcXBsW2FMBiF0Y8r3GQb6jeBxRauYRpo4yGQkMd4A7kg7Z/GUfSKe8703fKDkTATZsJsrr0RlZSJ9r4RLayMvLmJjnQS1d6IhJkwE2bT13U/DBzp5BN73xgRZsJMmM1HOolqb/yWiWpvjJSUiRZWopIykTATZsJs5g+1N6KSMiO1N/5DmAkzYTa9Lh6MhJkwE2ZzSZlo7xvRwson3txERzqJhJkwE2bT6+JhoKTMJ2pvjAgzYSbMfgDlXixqjH6gRgAAAABJRU5ErkJggg==`;

export const displayDefaultUser = ({ caip10 }: { caip10: string }): IUser => {
  const userCreated: IUser = {
    did: caip10,
    wallets: caip10,
    publicKey: 'temp',
    profilePicture: ProfilePicture,
    encryptedPrivateKey: 'temp',
    encryptionType: 'temp',
    signature: 'temp',
    sigType: 'temp',
    about: null,
    name: null,
    numMsg: 1,
    allowedNumMsg: 100,
    linkedListHash: null,
    msgSent: 0,
    maxMsgPersisted: 0,
    profile: {
      name: null,
      desc: null,
      picture: null,
      profileVerificationProof: null,
      blockedUsersList: null,
    },
    verificationProof: '',
    encryptedPassword: null,
    nftOwner: null,
  };
  return userCreated;
};

export const findObject = (
  data: any,
  parentArray: any[],
  property: string
): boolean => {
  let isPresent = false;
  if (data) {
    parentArray.map((value) => {
      if (value[property] == data[property]) {
        isPresent = true;
      }
    });
  }
  return isPresent;
};



export const addWalletValidation = (
  member: IUser,
  memberList: any,
  groupMembers: any,
  memberStatus: ParticipantStatus,
  limit:number
) => {


  let errorMessage = '';

  if (memberStatus?.participant) {
    errorMessage = 'This Member is Already present in the group';
  }
  if (findObject(member, memberList, 'wallets')) {
    errorMessage = 'Address is already added';
  }
  if (memberList?.length + groupMembers?.length >= limit) {
    errorMessage = 'No More Addresses can be added';
  }
  if (memberList?.length >= limit) {
    errorMessage = 'No More Addresses can be added';
  }
  return errorMessage;
};


 

export function isValidETHAddress(address: string) {
  return ethers.utils.isAddress(address);
}

export const checkIfMember = (chatFeed: IFeeds, account: string) => {
  const members = chatFeed?.groupInformation?.members || [];
  const pendingMembers = chatFeed?.groupInformation?.pendingMembers || [];
  const allMembers = [...members, ...pendingMembers];
  let isMember = false;
  allMembers.forEach((acc) => {
    if (acc.wallet.toLowerCase() === walletToPCAIP10(account!).toLowerCase()) {
      isMember = true;
    }
  });

  return isMember;
};

export const checkIfAccessVerifiedGroup = (groupInfo: Group) => {
  let isRules = false;
  if (
    groupInfo &&
    groupInfo.rules &&
    (groupInfo.rules?.entry ||
      groupInfo.rules?.chat)
  ) {
    isRules = true;
  }
  return isRules;
};

// Format address
export const formatAddress = async (
  chatPreviewPayload: IChatPreviewPayload,
  env: Env
) => {
  let formattedAddress = chatPreviewPayload?.chatParticipant;

  if (!chatPreviewPayload?.chatGroup) {
    // check and remove eip155:
    if (formattedAddress.includes('eip155:')) {
      formattedAddress = formattedAddress.replace('eip155:', '');
    } else if (formattedAddress.includes('.')) {
      formattedAddress = (await getAddress(formattedAddress, env))!;
    }
  }

  return formattedAddress;
};

// Format date
export const formatDate = (chatPreviewPayload: IChatPreviewPayload) => {
  let formattedDate;
  if (chatPreviewPayload.chatTimestamp) {
    const today = moment();
    const timestamp = moment(chatPreviewPayload.chatTimestamp);
    if (timestamp.isSame(today, 'day')) {
      // If the timestamp is from today, show the time
      formattedDate = timestamp.format('HH:mm');
    } else if (timestamp.isSame(today.subtract(1, 'day'), 'day')) {
      // If the timestamp is from yesterday, show 'Yesterday'
      formattedDate = 'Yesterday';
    } else {
      // If the timestamp is from before yesterday, show the date
      // Use 'L' to format the date based on the locale
      formattedDate = timestamp.format('L');
    }
  }

  return formattedDate ?? '';
};

// Generate random nonce
export const generateRandomNonce: () => string = () => {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

  // Transform chat payloads
 export  const transformChatItems: (items: IFeeds[]) => IChatPreviewPayload[] = (
    items: IFeeds[]
  ) => {
    // map but also filter to remove any duplicates which might creep in if stream sends a message
    const transformedItems: IChatPreviewPayload[] = items
      .map((item: IFeeds) => ({
        chatId: item.chatId,
        chatPic: item.groupInformation
          ? item.groupInformation.groupImage
          : item.profilePicture,
        chatParticipant: item.groupInformation
          ? item.groupInformation.groupName
          : item.did,
        chatGroup: item.groupInformation ? true : false,
        chatTimestamp: item.msg.timestamp,
        chatMsg: {
          messageType: item.msg.messageType,
          messageContent: item.msg.messageContent,
        },
      }))
      .filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.chatId === item.chatId)
      );

    return transformedItems;
  };

  export const transformStreamToIChatPreviewPayload: (
    item: any
  ) => IChatPreviewPayload = (item: any) => {
    // transform the item
    const transformedItem: IChatPreviewPayload = {
      chatId: item.chatId,
      chatPic: null, // for now, we don't have a way to get pfp from stream
      chatParticipant: item.meta.group
        ? null // we take from fetching info
        : (item?.event === 'chat.request')?item?.origin == 'self'?item.to[0] :item.from: item.to[0],
      chatGroup: item.meta.group,
      chatTimestamp: Number(item.timestamp),
      chatMsg: {
        messageType: item.message.type,
        messageContent: item.message.content,
      },
    };

    return transformedItem;
  };

  export const checkIfNewRequest = (item:any,chatId:string) => {
    if(item?.origin == 'self')
     return (walletToPCAIP10(chatId) === walletToPCAIP10(item?.to[0]));
     if(item?.origin == 'other')
     return (walletToPCAIP10(chatId) === walletToPCAIP10(item?.from));
    return false;
  }

  export  const transformStreamToIMessageIPFSWithCID: (
    item: any
  ) => IMessageIPFSWithCID = (item: any) =>{

    const transformedItem :IMessageIPFSWithCID = {
      fromCAIP10: item?.raw?.fromCAIP10,
      toCAIP10: item?.raw?.toCAIP10,
      fromDID: item?.raw?.fromDID,
      toDID: item?.raw?.toDID,
      messageType: item?.message?.type,
      messageObj: {content:item?.message?.content},
      sigType: item?.raw?.sigType,
      link:  item?.raw?.previousReference,
      timestamp: parseInt(item?.timestamp),
      encType: item?.raw?.encType,
      encryptedSecret: item?.raw?.encryptedSecret,
      cid: item?.reference,
      messageContent:  item?.message?.content,
      signature: item?.raw?.signature,
      verificationProof:  item?.raw?.verificationProof,
    }
    return transformedItem;

  }