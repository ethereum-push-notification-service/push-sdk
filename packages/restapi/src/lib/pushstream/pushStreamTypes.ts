import { Rules, VideoPeerInfo } from '../types';
import { ENV } from '../constants';

export type PushStreamInitializeProps = {
  filter?: {
    channels?: string[];
    chats?: string[];
    spaces?: string[];
    video?: string[];
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
  CHAT = 'STREAM.CHAT',
  CHAT_OPS = 'STREAM.CHAT_OPS',
  SPACE = 'STREAM.SPACE',
  SPACE_OPS = 'STREAM.SPACE_OPS',
  VIDEO = 'STREAM.VIDEO',
  CONNECT = 'STREAM.CONNECT',
  DISCONNECT = 'STREAM.DISCONNECT',
}

export enum NotificationEventType {
  INBOX = 'notification.inbox',
  SPAM = 'notification.spam',
}

export enum MessageOrigin {
  Other = 'other',
  Self = 'self',
}

export enum MessageEventType {
  Message = 'message',
  Request = 'request',
  Accept = 'accept',
  Reject = 'reject',
}

export enum GroupEventType {
  CreateGroup = 'createGroup',
  UpdateGroup = 'updateGroup',
  JoinGroup = 'joinGroup',
  LeaveGroup = 'leaveGroup',
  Remove = 'remove',
  RoleChange = 'roleChange',
}

export enum SpaceEventType {
  CreateSpace = 'createSpace',
  UpdateSpace = 'updateSpace',
  Join = 'joinSpace',
  Leave = 'leaveSpace',
  Remove = 'remove',
  Stop = 'stop',
  Start = 'start',
}

export enum VideoEventType {
  REQUEST = 'video.request',
  APPROVE = 'video.approve',
  DENY = 'video.deny',
  CONNECT = 'video.connect',
  DISCONNECT = 'video.disconnect',
  // retry events
  RETRY_REQUEST = 'video.retry.request',
  RETRY_APPROVE = 'video.retry.approve',
}

export enum ProposedEventNames {
  Message = 'chat.message',
  Request = 'chat.request',
  Accept = 'chat.accept',
  Reject = 'chat.reject',
  LeaveGroup = 'chat.group.participant.leave',
  JoinGroup = 'chat.group.participant.join',
  CreateGroup = 'chat.group.create',
  UpdateGroup = 'chat.group.update',
  Remove = 'chat.group.participant.remove',
  RoleChange = 'chat.group.participant.role',

  CreateSpace = 'space.create',
  UpdateSpace = 'space.update',
  SpaceRequest = 'space.request',
  SpaceAccept = 'space.accept',
  SpaceReject = 'space.reject',
  LeaveSpace = 'space.participant.leave',
  JoinSpace = 'space.participant.join',
  SpaceRemove = 'space.participant.remove',
  StartSpace = 'space.start',
  StopSpace = 'space.stop',
}

export interface Profile {
  image: string;
  publicKey: string;
}

export interface GroupMember {
  address: string;
  profile: Profile;
}

export interface Pending {
  members: GroupMember[];
  admins: GroupMember[];
}

export interface GroupMeta {
  name: string;
  description: string;
  image: string;
  owner: string;
  private: boolean;
  rules: Rules;
}

export interface GroupEventRawData {
  verificationProof: string;
}

export interface GroupEventBase {
  origin: MessageOrigin;
  timestamp: number
  chatId: string;
  from: string;
  meta: GroupMeta;
  raw?: GroupEventRawData;
  event: GroupEventType;
}

export interface CreateGroupEvent extends GroupEventBase {
  event: GroupEventType.CreateGroup;
}

export interface UpdateGroupEvent extends GroupEventBase {
  event: GroupEventType.UpdateGroup;
}

export interface GroupMemberEventBase {
  event: GroupEventType | MessageEventType;
  origin: MessageOrigin;
  timestamp: number
  chatId: string;
  from: string;
  to: string[];
  raw?: GroupEventRawData;
}

export interface JoinGroupEvent extends GroupMemberEventBase {
  event: GroupEventType.JoinGroup;
}

export interface LeaveGroupEvent extends GroupMemberEventBase {
  event: GroupEventType.LeaveGroup;
}

export interface RequestEvent extends GroupMemberEventBase {
  event: MessageEventType.Request;
  meta: {
    group: boolean;
  };
}

export interface RemoveEvent extends GroupMemberEventBase {
  event: GroupEventType.Remove;
}

export interface RoleEvent extends GroupMemberEventBase {
  newRole: string;
  event: GroupEventType.RoleChange;
}

export interface SpaceMemberEventBase {
  event: SpaceEventType | MessageEventType;
  origin: MessageOrigin;
  timestamp: number
  spaceId: string;
  from: string;
  to: string[];
  raw?: GroupEventRawData;
}

export interface JoinSpaceEvent extends SpaceMemberEventBase {
  event: SpaceEventType.Join;
}

export interface LeaveSpaceEvent extends SpaceMemberEventBase {
  event: SpaceEventType.Leave;
}

export interface SpaceRequestEvent extends SpaceMemberEventBase {
  event: MessageEventType.Request;
}

export interface SpaceRemoveEvent extends SpaceMemberEventBase {
  event: SpaceEventType.Remove;
}

export interface MessageEvent {
  event: MessageEventType;
  origin: MessageOrigin;
  timestamp: number
  chatId: string;
  from: string;
  to: string[];
  message: {
    type: string;
    content: string;
  };
  meta: {
    group: boolean;
  };
  reference: string;
  raw?: MessageRawData;
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
  timestamp: number
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
  raw?: {
    verificationProof: string;
  };
}

export interface MessageRawData {
  fromCAIP10: string;
  toCAIP10: string;
  fromDID: string;
  toDID: string;
  encType: string;
  encryptedSecret: string;
  signature: string;
  sigType: string;
  verificationProof: string;
  previousReference: string;
}

export interface VideoEvent {
  event: VideoEventType;
  origin: MessageOrigin;
  timestamp: number
  peerInfo: VideoPeerInfo;
  raw?: GroupEventRawData;
}

export enum EVENTS {
  // Websocket
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',

  // Notification
  USER_FEEDS = 'userFeeds',
  USER_SPAM_FEEDS = 'userSpamFeeds',

  // Chat
  CHAT_RECEIVED_MESSAGE = 'CHATS',
  CHAT_GROUPS = 'CHAT_GROUPS',
}

export type SocketInputOptions = {
  user: string;
  env: ENV;
  socketType?: 'notification' | 'chat';
  apiKey?: string;
  socketOptions?: SocketOptions;
};

type SocketOptions = {
  autoConnect: boolean;
  reconnectionAttempts?: number;
  reconnectionDelayMax?: number;
  reconnectionDelay?: number;
};
