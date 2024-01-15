import type { GroupDTO, GroupInfoDTO, IMessageIPFS } from '@pushprotocol/restapi';
import { IChatTheme } from "./theme";

export interface IChatViewListProps {
  chatId: string;
  chatFilterList?: Array<string>;
  limit?: number;
}

export interface IChatViewComponentProps {
  messageInput?: boolean;
  chatViewList?: boolean;
  chatFilterList?: Array<string>;
  chatProfile?: boolean; //name needs to change
  chatId: string; //need confirmation on this
  limit?: number;
  emoji?: boolean;
  gif?: boolean;
  file?: boolean;
  isConnected?: boolean;
  autoConnect?:boolean;
  groupInfoModalBackground?: ModalBackgroundType;
  groupInfoModalPositionType?: ModalPositionType;
  verificationFailModalBackground?: ModalBackgroundType;
  verificationFailModalPosition?: ModalPositionType;
  onVerificationFail?: () => void;
  component?: React.ReactNode;
}

export interface IChatProfile {
  chatId: string;
  groupInfoModalBackground?: ModalBackgroundType;
  groupInfoModalPositionType?: ModalPositionType;
  component?: React.ReactNode;
}

export interface TwitterFeedReturnType {
  tweetId: string;
  messageType: string;
}

export interface IToast {
  message: string;
  status: string;
}

export type IMessagePayload = IMessageIPFS;

export const CHAT_THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export type GIFType = {
  url: string;
  width: number;
  height: number;
};

export interface MessageInputProps {
  chatId: string;
  emoji?: boolean;
  gif?: boolean;
  file?: boolean;
  isConnected?: boolean;
  autoConnect?:boolean;
  verificationFailModalBackground?: ModalBackgroundType;
  verificationFailModalPosition?: ModalPositionType;
  onVerificationFail?: () => void;
}

export type Group = GroupInfoDTO| GroupDTO | undefined;

// export interface Feeds {
//   chatId?: string;
//   msg: IMessageIPFS;
//   did: string;
//   wallets: string;
//   profilePicture: string | null;
//   publicKey: string | null;
//   about: string | null;
//   threadhash: string | null;
//   intent: string | null;
//   intentSentBy: string | null;
//   intentTimestamp: Date;
//   combinedDID: string;
//   cid?: string;
//   groupInformation?: Group
// }

// export interface User {
//   did: string;
//   wallets: string;
//   profilePicture: string | null;
//   publicKey: string;
//   encryptedPrivateKey: string;
//   encryptionType: string;
//   signature: string;
//   sigType: string;
//   about: string | null;
//   name: string | null;
//   numMsg: number;
//   allowedNumMsg: number;
//   linkedListHash?: string | null;
//   isAdmin?:boolean;
// }

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
export interface CreateGroupModalProps {
  onClose: ()=>void;
  modalBackground?: ModalBackgroundType;
  modalPositionType?: ModalPositionType;
};


export interface ModalButtonProps {
  memberListCount?: boolean;
  theme?: IChatTheme;
  isLoading?: boolean;
};


export {IChatTheme} from './theme';

export interface ConditionData {
  operator?: string;
  type?: string;
  category?: string;
  subcategory?: string;
  data?: Record<string, any>;
}

export type ConditionArray = ConditionData[];