import { ENV } from '../constants';

export type PushStreamInitializeProps = {
  filter?: {
    channels?: string[];
  };
  connection?: {
    auto?: boolean;
    retries?: number;
  };
  raw?: boolean;
  env?: ENV;
  overrideAccount?: string;
};

export enum STREAM {
  PROFILE = 'STREAM.PROFILE',
  ENCRYPTION = 'STREAM.ENCRYPTION',
  NOTIF = 'STREAM.NOTIF',
  NOTIF_OPS = 'STREAM.NOTIF_OPS',
  CONNECT = 'STREAM.CONNECT',
  DISCONNECT = 'STREAM.DISCONNECT',
}

export enum NotificationEventType {
  INBOX = 'notification.inbox',
  SPAM = 'notification.spam',
}

export interface Profile {
  image: string;
  publicKey: string;
}

export const NOTIFICATION = {
  TYPE: {
    BROADCAST: 1,
    TARGETTED: 3,
    SUBSET: 4,
  },
} as const;

export type NotificationType = keyof typeof NOTIFICATION.TYPE;

export interface NotificationEvent {
  event: NotificationEventType;
  origin: 'other' | 'self';
  timestamp: string;
  from: string;
  to: string[];
  notifID: string;
  channel: {
    name: string;
    icon: string;
    url: string;
  };
  meta: {
    type: string;
  };
  message: {
    notification: {
      title: string;
      body: string;
    };
    payload?: {
      title?: string;
      body?: string;
      cta?: string;
      embed?: string;
      meta?: {
        domain?: string;
        type: string;
        data: string;
      };
    };
  };
  config?: {
    expiry?: number;
    silent?: boolean;
    hidden?: boolean;
  };
  advanced?: {
    chatid?: string;
  };
  source: string;
  streamUid?: string;
  raw?: {
    verificationProof: string;
  };
}

export enum EVENTS {
  // Websocket
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',

  // Notification
  USER_FEEDS = 'userFeeds',
  USER_SPAM_FEEDS = 'userSpamFeeds',
}

export type SocketInputOptions = {
  user: string;
  env: ENV;
  apiKey?: string;
  socketOptions?: SocketOptions;
};

type SocketOptions = {
  autoConnect: boolean;
  reconnectionAttempts?: number;
  reconnectionDelayMax?: number;
  reconnectionDelay?: number;
};
