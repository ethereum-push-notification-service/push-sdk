import { TypedDataDomain, TypedDataField } from 'ethers';
import {
  ADDITIONAL_META_TYPE,
  IDENTITY_TYPE,
  NOTIFICATION_TYPE,
  SPACE_ACCEPT_REQUEST_TYPE,
  SPACE_DISCONNECT_TYPE,
  SPACE_INVITE_ROLES,
  SPACE_REQUEST_TYPE,
  VIDEO_NOTIFICATION_ACCESS_TYPE,
} from '../../lib/payloads/constants';
import { ENV, MessageType } from '../constants';
import { EthEncryptedData } from '@metamask/eth-sig-util';
import { Message, MessageObj } from './messageTypes';
import { Lit } from '../payloads/litHelper';
export * from './messageTypes';
export * from './videoTypes';

export type Env = typeof ENV[keyof typeof ENV];

// the type for the the response of the input data to be parsed
export type ApiNotificationType = {
  payload_id: number;
  channel: string;
  epoch: string;
  payload: {
    apns: {
      payload: {
        aps: {
          category: string;
          'mutable-content': number;
          'content-available': number;
        };
      };
      fcm_options: {
        image: string;
      };
    };
    data: {
      app: string;
      sid: string;
      url: string;
      acta: string;
      aimg: string;
      amsg: string;
      asub: string;
      icon: string;
      type: string;
      epoch: string;
      appbot: string;
      hidden: string;
      secret: string;
    };
    android: {
      notification: {
        icon: string;
        color: string;
        image: string;
        default_vibrate_timings: boolean;
      };
    };
    notification: {
      body: string;
      title: string;
    };
  };
  source: string;
};

// The output response from parsing a notification object
export type ParsedResponseType = {
  cta: string;
  title: string;
  message: string;
  icon: string;
  url: string;
  sid: string;
  app: string;
  image: string;
  blockchain: string;
  secret: string;
  notification: {
    title: string;
    body: string;
  };
};

export interface VideoNotificationRules {
  access: {
    type: VIDEO_NOTIFICATION_ACCESS_TYPE;
    data: {
      chatId?: string;
    };
  };
}

// SendNotificationRules can be extended in the future for other use cases
export type SendNotificationRules = VideoNotificationRules;

export interface ISendNotificationInputOptions {
  senderType?: 0 | 1;
  signer: any;
  type: NOTIFICATION_TYPE;
  identityType: IDENTITY_TYPE;
  notification?: {
    title: string;
    body: string;
  };
  payload?: {
    sectype?: 'PGPV1' | 'LITV1' | null;
    title: string;
    body: string;
    cta: string;
    img: string;
    hidden?: boolean;
    etime?: number;
    silent?: boolean;
    additionalMeta?:
      | {
          /**
           * type = ADDITIONAL_META_TYPE+VERSION
           * VERSION > 0
           */
          type: `${ADDITIONAL_META_TYPE}+${number}`;
          data: string;
          domain?: string;
        }
      | string;
    /**
     * @deprecated
     * use additionalMeta instead
     */
    metadata?: any;
    index?: string;
  };
  recipients?: string | string[]; // CAIP or plain ETH
  channel: string; // CAIP or plain ETH
  /**
   * @deprecated
   * use payload.etime instead
   */
  expiry?: number;
  /**
   * @deprecated
   * use payload.hidden instead
   */
  hidden?: boolean;
  graph?: {
    id: string;
    counter: number;
  };
  ipfsHash?: string;
  env?: ENV;
  /** @deprecated - Use `rules` object instead */
  chatId?: string;
  rules?: SendNotificationRules;
  pgpPrivateKey?: string;
  lit?: Lit 
}

export interface INotificationPayload {
  notification: {
    title: string;
    body: string;
  };
  data: {
    acta: string;
    aimg: string;
    amsg: string;
    asub: string;
    type: string;
    etime?: number;
    hidden?: boolean;
    sectype?: string;
  };
  recipients: any;
}

export interface IMessageIPFS {
  fromCAIP10: string;
  toCAIP10: string;
  fromDID: string;
  toDID: string;
  messageType: string;
  messageObj?: MessageObj | string;
  /**
   * @deprecated - Use messageObj.content instead
   */
  messageContent: string;
  verificationProof?: string;
  /**
   * @deprecated - Use verificationProof instead
   */
  signature: string;
  /**
   * @deprecated - Use verificationProof instead
   */
  sigType: string;
  link: string | null;
  timestamp?: number;
  encType: string;
  encryptedSecret: string | null;
  sessionKey?: string;
  /**
   * scope only at sdk level
   */
  deprecated?: boolean;
  /**
   * scope only at sdk level
   */
  deprecatedCode?: string;
}
export interface IFeeds {
  msg: IMessageIPFS;
  did: string;
  wallets: string;
  profilePicture: string | null;
  name: string | null;
  publicKey: string | null;
  about: string | null;
  threadhash: string | null;
  intent: string | null;
  intentSentBy: string | null;
  intentTimestamp: Date;
  combinedDID: string;
  cid?: string;
  chatId?: string;
  groupInformation?: GroupDTO;
  deprecated?: boolean; // scope only at sdk level
  deprecatedCode?: string; // scope only at sdk level
}

export interface SpaceIFeeds {
  msg: IMessageIPFS;
  did: string;
  wallets: string;
  profilePicture: string | null;
  name: string | null;
  publicKey: string | null;
  about: string | null;
  threadhash: string | null;
  intent: string | null;
  intentSentBy: string | null;
  intentTimestamp: Date;
  combinedDID: string;
  cid?: string;
  spaceId?: string;
  spaceInformation?: SpaceDTO;
}

export interface IUser {
  msgSent: number;
  maxMsgPersisted: number;
  did: string;
  wallets: string;
  profile: {
    name: string | null;
    desc: string | null;
    picture: string | null;
    profileVerificationProof: string | null;
    blockedUsersList: Array<string> | null;
  };
  encryptedPrivateKey: string;
  publicKey: string;
  verificationProof: string;
  origin?: string | null;

  /**
   * @deprecated Use `profile.name` instead.
   */
  name: string | null;
  /**
   * @deprecated Use `profile.desc` instead.
   */
  about: string | null;
  /**
   * @deprecated Use `profile.picture` instead.
   */
  profilePicture: string | null;
  /**
   * @deprecated Use `msgSent` instead.
   */
  numMsg: number;
  /**
   * @deprecated Use `maxMsgPersisted` instead.
   */
  allowedNumMsg: number;
  /**
   * @deprecated Use `encryptedPrivateKey.version` instead.
   */
  encryptionType: string;
  /**
   * @deprecated Use `verificationProof` instead.
   */
  signature: string;
  /**
   * @deprecated Use `verificationProof` instead.
   */
  sigType: string;
  /**
   * @deprecated Use `encryptedPrivateKey.encryptedPassword` instead.
   */
  encryptedPassword: string | null;
  /**
   * @deprecated
   */
  nftOwner: string | null;
  /**
   * @deprecated Not recommended to be used anywhere
   */
  linkedListHash?: string | null;
  /**
   * @deprecated Not recommended to be used anywhere
   */
  nfts?: [] | null;
}

export interface Member {
  wallet: string;
  publicKey: string;
}

export enum ChatStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  ENDED = 'ENDED',
}

export enum ConditionType {
  PUSH = 'PUSH',
  GUILD = 'GUILD',
}

export enum GROUP_RULES_CATEGORY {
  PUSH = 'PUSH',
  GUILD = 'GUILD',
  ERC721 = 'ERC721',
  ERC20 = 'ERC20',
  CUSTOM_ENDPOINT = 'CustomEndpoint',
  INVITE = 'INVITE',
}

export enum GROUP_RULES_SUB_CATEGORY {
  DEFAULT = 'DEFAULT',
  HOLDER = 'holder',
  GET = 'GET',
}

export enum GROUP_RULES_PERMISSION {
  ENTRY = 'Entry',
  CHAT = 'Chat',
}

export enum GROUP_INVITER_ROLE {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
}

export type Data = {
  contract?: string;
  amount?: number;
  decimals?: number;
  id?: string;
  role?: string;
  url?: string;
  comparison?: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'all' | 'any';
};

export type ConditionBase = {
  type?: ConditionType;
  category?: string;
  subcategory?: string;
  data?: Data;
  access?: boolean;
};

export type Condition = ConditionBase & {
  any?: ConditionBase[];
  all?: ConditionBase[];
};

export interface Rules {
  entry?: {
    conditions: Array<Condition | ConditionBase> | (Condition | ConditionBase);
  };
  chat?: {
    conditions: Array<Condition | ConditionBase> | (Condition | ConditionBase);
  };
}

export interface SpaceRules {
  entry?: {
    conditions: Array<Condition | ConditionBase> | (Condition | ConditionBase);
  };
}

export interface GroupAccess {
  entry: boolean;
  chat: boolean;
  rules?: Rules;
}

export interface SpaceAccess {
  entry: boolean;
  rules?: SpaceRules;
}

export interface GroupMemberStatus {
  isMember: boolean;
  isPending: boolean;
  isAdmin: boolean;
}

export interface SpaceAccess {
  entry: boolean;
  rules?: SpaceRules;
}

export interface RoleCounts {
  total: number;
  pending: number;
}

export interface ChatMemberCounts {
  overallCount: number;
  adminsCount: number;
  membersCount: number;
  pendingCount: number;
  approvedCount: number;
  roles: {
    ADMIN: RoleCounts;
    MEMBER: RoleCounts;
  };
}

export interface GroupParticipantCounts {
  participants: number;
  pending: number;
}

export interface ChatMemberProfile {
  address: string;
  intent: boolean;
  role: string;
  userInfo: UserV2;
}

export interface SpaceMemberProfile {
  address: string;
  intent: boolean;
  role: string;
  userInfo: UserV2;
}

export interface GroupMembersInfo {
  totalMembersCount: number;
  members: ChatMemberProfile[];
}

export interface UserProfile {
  name: string | null;
  desc: string | null;
  picture: string | null;
  blockedUsersList: Array<string> | null;
  profileVerificationProof: string | null;
}

export interface UserV2 {
  msgSent: number;
  maxMsgPersisted: number;
  did: string;
  wallets: string;
  profile: UserProfile;
  encryptedPrivateKey: string | null;
  publicKey: string | null;
  verificationProof: string | null;
  origin?: string | null;
}

export interface GroupDTO {
  members: {
    wallet: string;
    publicKey: string;
    isAdmin: boolean;
    image: string;
  }[];
  pendingMembers: {
    wallet: string;
    publicKey: string;
    isAdmin: boolean;
    image: string;
  }[];
  contractAddressERC20: string | null;
  numberOfERC20: number;
  contractAddressNFT: string | null;
  numberOfNFTTokens: number;
  verificationProof: string;
  groupImage: string | null;
  groupName: string;
  isPublic: boolean;
  groupDescription: string;
  groupCreator: string;
  chatId: string;
  scheduleAt?: Date | null;
  scheduleEnd?: Date | null;
  groupType?: string;
  status?: ChatStatus | null;
  rules?: Rules | null;
  meta?: string | null;
  sessionKey?: string;
  encryptedSecret?: string;
}

export interface GroupInfoDTO {
  groupName: string;
  groupImage: string | null;
  groupDescription: string;
  isPublic: boolean;
  groupCreator: string;
  chatId: string;
  scheduleAt?: Date | null;
  scheduleEnd?: Date | null;
  groupType?: string;
  status?: ChatStatus | null;
  rules?: Rules | null;
  meta?: string | null;
  sessionKey: string | null;
  encryptedSecret: string | null;
}

export interface SpaceInfoDTO {
  spaceName: string;
  spaceImage: string | null;
  spaceDescription: string;
  isPublic: boolean;
  spaceCreator: string;
  spaceId: string;
  scheduleAt?: Date | null;
  scheduleEnd?: Date | null;
  status?: ChatStatus | null;
  rules?: Rules | null;
  meta?: string | null;
  sessionKey: string | null;
  encryptedSecret: string | null;
  inviteeDetails?: { [key: string]: SPACE_INVITE_ROLES };
}

export interface SpaceDTO {
  members: {
    wallet: string;
    publicKey: string;
    isSpeaker: boolean;
    image: string;
  }[];
  pendingMembers: {
    wallet: string;
    publicKey: string;
    isSpeaker: boolean;
    image: string;
  }[];
  contractAddressERC20: string | null;
  numberOfERC20: number;
  contractAddressNFT: string | null;
  numberOfNFTTokens: number;
  verificationProof: string;
  spaceImage: string | null;
  spaceName: string;
  isPublic: boolean;
  spaceDescription: string;
  spaceCreator: string;
  spaceId: string;
  scheduleAt?: Date | null;
  scheduleEnd?: Date | null;
  status: ChatStatus | null;
  inviteeDetails?: { [key: string]: SPACE_INVITE_ROLES };
  rules?: SpaceRules | null;
  meta?: string | null;
}

export interface Peer {
  address: string;
  emojiReactions: {
    emoji: string;
    expiresIn: string;
  } | null;
}

export interface ListenerPeer extends Peer {
  handRaised: boolean;
}

export interface AdminPeer extends Peer {
  audio: boolean | null;
}

export interface LiveSpaceData {
  host: AdminPeer;
  coHosts: AdminPeer[];
  speakers: AdminPeer[];
  listeners: ListenerPeer[];
}

export interface SpaceSpecificData extends SpaceDTO {
  liveSpaceData: LiveSpaceData;
}

export interface SpaceData extends SpaceSpecificData {
  connectionData: VideoCallData;
}

export interface Subscribers {
  itemcount: number;
  subscribers: Array<string>;
}
export interface IConnectedUser extends IUser {
  privateKey: string | null;
}

export interface IMessageIPFSWithCID extends IMessageIPFS {
  cid: string;
}

export interface AccountEnvOptionsType extends EnvOptionsType {
  /**
   * Environment variable
   */
  account: string;
}

export interface ChatStartOptionsType {
  messageType: `${MessageType}`;
  messageObj: MessageObj | string;
  /**
   * @deprecated - To be used for now to provide backward compatibility
   */
  messageContent: string;
  receiverAddress: string;
  connectedUser: IConnectedUser;
  env: ENV;
}

/**
 * EXPORTED ( Chat.send )
 */
export interface ChatSendOptionsType {
  /** Message to be send */
  message?: Message;
  /**
   * Message Sender's Account ( DID )
   * In case account is not provided, it will be derived from signer
   */
  account?: string;
  /** Message Receiver's Account ( DID ) */
  to?: string;
  /**
   * Message Sender's ethers signer or viem walletClient
   * Used for deriving account if not provided
   * Used for decrypting pgpPrivateKey if not provided
   */
  signer?: SignerType;
  /**
   * Message Sender's decrypted pgp private key
   * Used for signing message
   */
  pgpPrivateKey?: string;
  /** Enironment - prod, staging, dev */
  env?: ENV;
  /** @deprecated - Use message instead */
  messageObj?: MessageObj;
  /** @deprecated - Use message.content instead */
  messageContent?: string;
  /** @deprecated - Use message.type instead */
  messageType?: `${MessageType}`;
  /** @deprecated - Use to instead */
  receiverAddress?: string;
  /** @deprecated Not needed anymore */
  apiKey?: string;
}

export interface ConversationHashOptionsType extends AccountEnvOptionsType {
  conversationId: string;
}

export interface UserInfo {
  wallets: string;
  publicKey: string;
  name: string;
  image: string;
  isAdmin: boolean;
}

export type ethersV5SignerType = {
  _signTypedData: (
    domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
    value: Record<string, any>
  ) => Promise<string>;
  getAddress: () => Promise<string>;
  signMessage: (message: Uint8Array | string) => Promise<string>;
  privateKey?: string;
  provider?: any;
};

export type ethersV6SignerType = {
  signTypedData: (
    domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
    value: Record<string, any>
  ) => Promise<string>;
  getAddress: () => Promise<string>;
  signMessage: (message: Uint8Array | string) => Promise<string>;
  privateKey?: string;
  provider?: any;
};

export type viemSignerType = {
  signTypedData: (args: {
    account: any;
    domain: any;
    types: any;
    primaryType: any;
    message: any;
  }) => Promise<`0x${string}`>;
  getChainId: () => Promise<number>;
  signMessage: (args: {
    message: any;
    account: any;
    [key: string]: any;
  }) => Promise<`0x${string}`>;
  account: { [key: string]: any };
  privateKey?: string;
  provider?: any;
};

export type SignerType =
  | ethersV5SignerType
  | ethersV6SignerType
  | viemSignerType;

export type EnvOptionsType = {
  env?: ENV;
};

export type walletType = {
  account: string | null;
  signer: SignerType | null;
};

export type encryptedPrivateKeyTypeV1 = EthEncryptedData;

export type encryptedPrivateKeyTypeV2 = {
  ciphertext: string;
  version?: string;
  salt?: string;
  nonce: string;
  preKey?: string;
  encryptedPassword?: encryptedPrivateKeyTypeV2;
};

export type encryptedPrivateKeyType = {
  version?: string;
  nonce: string;
  ephemPublicKey?: string;
  ciphertext: string;
  salt?: string;
  preKey?: string;
  encryptedPassword?: encryptedPrivateKeyTypeV2;
};

export type ProgressHookType = {
  progressId: string;
  progressTitle: string;
  progressInfo: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
};
export type ProgressHookTypeFunction = (...args: any[]) => ProgressHookType;

export type MessageWithCID = {
  cid: string;
  chatId: string;
  link: string;
  fromCAIP10: string;
  toCAIP10: string;
  fromDID: string;
  toDID: string;
  messageType: string;
  messageObj?: MessageObj | string;
  /**
   * @deprecated - Use messageObj.content instead
   */
  messageContent: string;
  /**
   * @deprecated - Use verificationProof instead
   */
  signature: string;
  /**
   * @deprecated - Use VerificationProof instead
   */
  sigType: string;
  timestamp?: number;
  encType: string;
  encryptedSecret: string | null;
  verificationProof?: string;
  sessionKey?: string;
};

export type IMediaStream = MediaStream | null;

export enum VideoCallStatus {
  UNINITIALIZED,
  INITIALIZED,
  RECEIVED,
  CONNECTED,
  DISCONNECTED,
  ENDED,
  RETRY_INITIALIZED,
  RETRY_RECEIVED,
}

export type PeerData = {
  stream: IMediaStream;
  audio: boolean | null;
  video: boolean | null;
  address: string;
  status: VideoCallStatus;
  retryCount: number;
};

export type VideoCallData = {
  meta: {
    chatId: string;
    initiator: {
      address: string;
      signal: any;
    };
    broadcast?: {
      livepeerInfo: any;
      hostAddress: string;
      coHostAddress?: string;
    };
  };
  local: {
    stream: IMediaStream;
    audio: boolean | null;
    video: boolean | null;
    address: string;
  };
  incoming: PeerData[];
};

export type VideoCreateInputOptions = {
  video?: boolean;
  audio?: boolean;
  stream?: MediaStream; // for backend use
};

export type VideoRequestInputOptions = {
  senderAddress: string;
  recipientAddress: string | string[];
  /** @deprecated - Use `rules` object instead */
  chatId?: string;
  rules?: VideoNotificationRules;
  onReceiveMessage?: (message: string) => void;
  retry?: boolean;
  details?: {
    type: SPACE_REQUEST_TYPE;
    data: Record<string, unknown>;
  };
};

export type VideoAcceptRequestInputOptions = {
  signalData: any;
  senderAddress: string;
  recipientAddress: string;
  /** @deprecated - Use `rules` object instead */
  chatId?: string;
  rules?: VideoNotificationRules;
  onReceiveMessage?: (message: string) => void;
  retry?: boolean;
  details?: {
    type: SPACE_ACCEPT_REQUEST_TYPE;
    data: Record<string, unknown>;
  };
};

export type VideoConnectInputOptions = {
  signalData: any;
  peerAddress?: string;
};

export type VideoDisconnectOptions = {
  peerAddress: string;
  details?: {
    type: SPACE_DISCONNECT_TYPE;
    data: Record<string, unknown>;
  };
} | null;

export type EnableVideoInputOptions = {
  state: boolean;
};

export type EnableAudioInputOptions = {
  state: boolean;
};
