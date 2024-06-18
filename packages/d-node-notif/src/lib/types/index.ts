// for namespace TYPES
/* eslint-disable @typescript-eslint/no-namespace */
import {
  ADDITIONAL_META_TYPE,
  IDENTITY_TYPE,
  NOTIFICATION_TYPE,
  VIDEO_NOTIFICATION_ACCESS_TYPE,
} from '../../lib/payloads/constants';
import { ENV } from '../constants';
import { EthEncryptedData } from '@metamask/eth-sig-util';

export type Env = (typeof ENV)[keyof typeof ENV];

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

export type ApiSubscriptionType = {
  channel: string;
  user_settings: string | null;
};

export type NotificationSettingType = {
  type: number;
  default?: number | { upper: number; lower: number };
  description: string;
  data?: {
    upper: number;
    lower: number;
    ticker?: number;
  };
  userPreferance?: {
    value: number | { upper: number; lower: number };
    enabled: boolean;
  };
};

export type ApiSubscribersType = {
  itemcount: number;
  subscribers: {
    subscriber: string;
    settings: string | null;
  }[];
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
    sectype?: string;
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
  channelFound?: boolean;
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

export interface Subscribers {
  itemcount: number;
  subscribers: Array<string>;
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

export interface IConnectedUser extends IUser {
  privateKey: string | null;
}

export interface AccountEnvOptionsType extends EnvOptionsType {
  /**
   * Environment variable
   */
  account: string;
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

export type TypedDataField = {
  name: string;
  type: string;
};

export type TypedDataDomain = {
  chainId?: number | undefined;
  name?: string | undefined;
  salt?: string | undefined;
  verifyingContract?: string | undefined;
  version?: string | undefined;
};

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

export enum NotifictaionType {
  BROADCAT = 1,
  TARGETTED = 3,
  SUBSET = 4,
}
