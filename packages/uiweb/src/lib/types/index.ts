import type { ENV } from '../config';
import type { ParsedResponseType, IFeeds,  PushAPI,IMessageIPFS } from '@pushprotocol/restapi';
import { Bytes, TypedDataDomain, TypedDataField, providers } from 'ethers';



export interface AccountEnvOptionsType {
  env?: ENV;
  account: string;
  signer: SignerType;
  pushUser: PushAPI;
}

export interface ITheme {
  bgColorPrimary?: string;
  bgColorSecondary?: string;
  textColorPrimary?: string;
  textColorSecondary?: string;
  btnColorPrimary?: string;
  btnColorSecondary?: string;
  border?: string;
  borderRadius?: string;
  moduleColor?: string;
}

type ethersV5SignerType = {
  _signTypedData: (
    domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
    value: Record<string, any>
  ) => Promise<string>;
  getChainId: () => Promise<number>;
  getAddress: () => Promise<string>;
  signMessage: (message: Bytes | string) => Promise<string>;
  privateKey?: string;
  provider?: providers.Provider;
};
type viemSignerType = {
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
  provider?: providers.Provider;
};

export type SignerType = ethersV5SignerType | viemSignerType;

export type ParsedNotificationType = ParsedResponseType & {
  channel:string;
};

export type NotificationFeedsType = { [key: string]:ParsedNotificationType};
export type ChatFeedsType = { [key: string]:IFeeds};
export interface Web3NameListType {
  [key: string]: string;
}
export const PUSH_TABS = {
  CHATS: 'CHATS',
  APP_NOTIFICATIONS: 'APP_NOTIFICATIONS'
} as const;

export const SOCKET_TYPE = {
  CHAT: 'chat',
  NOTIFICATION: 'notification'
} as const;

export const PUSH_SUB_TABS = {
  REQUESTS: 'REQUESTS',
  SPAM:'SPAM'
} as const;

export const LOCAL_STORAGE_KEYS = {
  CHATS: 'CHATS',
} as const;

export const SIDEBAR_PLACEHOLDER_KEYS = {
  CHAT: 'CHAT',
  SEARCH: 'SEARCH',
  NOTIFICATION: 'NOTIFICATION',
  NEW_CHAT: 'NEW_CHAT'
} as const;

export type SidebarPlaceholderKeys = (typeof SIDEBAR_PLACEHOLDER_KEYS)[keyof typeof SIDEBAR_PLACEHOLDER_KEYS];

export type LocalStorageKeys = (typeof LOCAL_STORAGE_KEYS)[keyof typeof LOCAL_STORAGE_KEYS];
export type PushTabs = (typeof PUSH_TABS)[keyof typeof PUSH_TABS];
export type PushSubTabs = (typeof PUSH_SUB_TABS)[keyof typeof PUSH_SUB_TABS];
export type SocketType = (typeof SOCKET_TYPE)[keyof typeof SOCKET_TYPE];

export interface FileMessageContent {
  content: string
  name: string
  type: string
  size: number
}
export type Messagetype = { messages: IMessageIPFS[]; lastThreadHash: string | null };

