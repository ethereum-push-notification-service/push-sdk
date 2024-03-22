import type { Dispatch, ReactElement, ReactNode } from 'react';
import type { ENV } from '../config';
import type { ParsedResponseType, IFeeds, Rules, PushAPI, } from '@pushprotocol/restapi';
import { Bytes, TypedDataDomain, TypedDataField, providers } from 'ethers';
import { ConditionArray, IChatTheme } from '../components';
import { ChatMemberProfile } from '@pushprotocol/restapi';
import { Group, User } from '../components';
import { DropdownValueType } from '../components/chat/reusables';
import { CriteriaStateType } from '../components/chat/types';

export interface IMessageIPFS {
  cid? : string;
  chatId? :string;
  event? :string;
  from?:string;
  message?: IMessage;
  meta?: any;
  origin?:string;
  reference? :string;
  to?: string[];
  fromCAIP10: string;
  toCAIP10: string;
  fromDID: string;
  toDID: string;
  messageType: string;
  messageContent: string;
  signature: string;
  sigType: string;
  link: string | null;
  timestamp?: number;
  encType: string;
  encryptedSecret: string | null;
  icon?: ReactElement<string | any>;
}

interface IMessage {
  content: string | undefined;
  type: string | undefined;
}

export interface AccountEnvOptionsType {
  env?: ENV;
  account: string;
  signer: SignerType;
  user: PushAPI;
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

export type SignerType =  ethersV5SignerType| ethersV6SignerType| viemSignerType;;

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

export interface IGroup {
  members: { wallet: string, publicKey: string, isAdmin: boolean, image: string }[],
  pendingMembers: { wallet: string, publicKey: string, isAdmin: boolean, image: string }[],
  contractAddressERC20: string | null,
  numberOfERC20: number,
  contractAddressNFT: string | null,
  numberOfNFTTokens: number,
  verificationProof: string,
  groupImage: string | null,
  groupName: string,
  isPublic: boolean,
  groupDescription: string | null,
  groupCreator: string,
  chatId: string,
  groupType?:string | undefined,
  rules?: Rules | null,
}

export interface IChatUIProviderProps {
  children: ReactNode;
  theme?: IChatTheme;
  account?: string | null;
  signer?: SignerType | undefined;
  pgpPrivateKey?: string | null;
  user?: PushAPI | undefined;
  env?: ENV;
}

export const MODAL_BACKGROUND_TYPE = {
  OVERLAY:'OVERLAY',
  BLUR: 'BLUR',
  TRANSPARENT: 'TRANSPARENT',

  } as const;
  
  export type ModalBackgroundType = keyof typeof MODAL_BACKGROUND_TYPE;

  export const MODAL_POSITION_TYPE = {
    RELATIVE:'RELATIVE',
    GLOBAL: 'GLOBAL',
    } as const;
    
  export type ModalPositionType = keyof typeof MODAL_POSITION_TYPE;

  export interface MemberPaginationData {
    page: number;
    finishedFetching: boolean;
    loading: boolean;
    reset: boolean;
  }

export interface MembersType {
  accepted: ChatMemberProfile[];
  pending: ChatMemberProfile[];
  loading: boolean;
}

export interface ConditionsInformationProps {
  theme: IChatTheme;
  groupInfo?: Group | null;
  alert?: boolean;
  header?: string;
  subheader?: string;
}

export type MemberListContainerType = {
  key?: number;
  memberData: User;
  handleMemberList: (member: User) => void;
  handleMembers?: (value: User[]) => void;
  darkIcon: any;
  memberList?: any;
};

export interface WalletProfileContainerProps {
  id?: any;
  background?: any;
  border?: string;
};

export type MemberProfileCardProps = {
  key?: number | string;
  member?: any;
  dropdownValues?: any;
  selectedMemberAddress?: any;
  setSelectedMemberAddress?: any;
  dropdownRef?: any;
};

export interface ShadowedProps {
  setPosition: boolean;
}

export type PendingMembersProps = {
  pendingMemberPaginationData: MemberPaginationData;
  setPendingMemberPaginationData: React.Dispatch<
    React.SetStateAction<MemberPaginationData>
  >;
  pendingMembers: ChatMemberProfile[];
  setShowPendingRequests: React.Dispatch<React.SetStateAction<boolean>>;
  showPendingRequests: boolean;
  count: number;
  theme: IChatTheme;
};

export type AcceptedMembersProps = {
  acceptedMemberPaginationData: MemberPaginationData;
  setAcceptedMemberPaginationData: React.Dispatch<
    React.SetStateAction<MemberPaginationData>
  >;
  acceptedMembers: ChatMemberProfile[];
  chatId: string;
};

/**
 * @interface IThemeProps
 * this interface is used for defining the props for styled components
 */
export interface IThemeProps {
  theme?: IChatTheme;
}

export interface IApproveRequestBubbleProps {
  chatId: string;
  chatFeed: IFeeds;
  setChatFeed: Dispatch<IFeeds>;
}

export interface AddButtonsProps {
  title: string;
  handleNext?: () => void;
}

export type AddWalletContentProps = {
  onSubmit: () => void;
  onClose: () => void;
  handlePrevious: () => void;
  memberList: any;
  handleMemberList: any;
  isLoading?: boolean;
  isPublic: boolean;
};

export interface CriteriaProps {
  conditionData: ConditionArray[];
  moreOptions?: boolean;
  deleteFunction?: (idx: number) => void;
  updateFunction?: (idx: number) => void;
}

export interface MoreOptionsContainerProps {
  handleMoreOptionsClick: (row: number, col: number) => void;
  setSelectedIndex: any;
  selectedIndex: Array<number> | null;
  row: number;
  col: number;
  dropDownValues: DropdownValueType[];
}

export interface GroupInputDetailsType {
  groupName: string;
  groupDescription: string;
  groupImage: string;
  groupMembers: any;
  groupEncryptionType: string;
}

export interface AddConditionProps {
  heading: string;
  subHeading: string;
  handleNext?: () => void;
  criteriaState: CriteriaStateType;
}

export interface OperatorContainerProps {
  operator: string;
  setOperator: any;
}
