import { ADDITIONAL_META_TYPE } from '../../lib/payloads/constants';
import { GetAliasInfoOptionsType } from '../alias';
import { NotifictaionType, ProgressHookType } from '../types';
import { SOURCE_TYPES } from '../payloads/constants';

export type SubscriptionOptions = {
  account?: string;
  page?: number;
  limit?: number;
  channel?: string;
  raw?: boolean;
};
export type ChannelInfoOptions = {
  channel?: string;
  page?: number;
  limit?: number;
  category?: number;
  setting?: boolean;
  raw?: boolean;
};

export type SubscribeUnsubscribeOptions = {
  onSuccess?: () => void;
  onError?: (err: Error) => void;
  settings?: UserSetting[];
};

export type UserSetting = {
  enabled: boolean;
  value?: number | { lower: number; upper: number };
};

export type AliasOptions = Omit<GetAliasInfoOptionsType, 'env'>;

export type AliasInfoOptions = {
  raw?: boolean;
  version?: number;
}

export enum FeedType {
  INBOX = 'INBOX',
  SPAM = 'SPAM',
}

export type FeedsOptions = {
  account?: string;
  //TODO: change it to string[] once we start supporting multiple channel
  channels?: string[];
  page?: number;
  limit?: number;
  raw?: boolean;
};

export type ChannelSearchOptions = {
  page?: number;
  limit?: number;
};

// Types related to notification
export type INotification = {
  title: string;
  body: string;
};

export type IPayload = {
  title?: string;
  body?: string;
  cta?: string;
  embed?: string;
  category?: number;
  meta?: {
    domain?: string;
    type: `${ADDITIONAL_META_TYPE}+${number}`;
    data: string;
  };
};

export type IConfig = {
  expiry?: number;
  silent?: boolean;
  hidden?: boolean;
};

export type IAdvance = {
  graph?: {
    id: string;
    counter: number;
  };
  ipfs?: string;
  minimal?: string;
  chatid?: string;
  pgpPrivateKey?: string;
};

export type NotificationOptions = {
  notification: INotification;
  payload?: IPayload;
  config?: IConfig;
  advanced?: IAdvance;
  channel?: string;
};

export type CreateChannelOptions = {
  name: string;
  description: string;
  icon: string;
  url: string;
  alias?: string;
  tags?: string[];
  progressHook?: (progress: ProgressHookType) => void;
};

export type NotificationSetting = {
  type: number;
  default: number | { upper: number; lower: number };
  description: string;
  data?: {
    upper: number;
    lower: number;
    enabled?: boolean;
    ticker?: number;
  };
};

export type NotificationSettings = NotificationSetting[];

export type ChannelFeedsOptions = {
  page?: number;
  limit?: number;
  raw?: boolean;
  filter?: NotifictaionType;
};
export type ChannelOptions = {
  raw: boolean;
};



export enum ChannelListType {
  ALL = 'all',
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
}

export enum ChannelListSortType {
  SUBSCRIBER = 'subscribers',
}



export type ChannelListOptions = {
  page?: number;
  limit?: number;
  sort?: ChannelListSortType;
  order?: ChannelListOrderType;
  filter?:  keyof typeof SOURCE_TYPES | 'ALL';
};





export enum ChannelListOrderType {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
};