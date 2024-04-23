import { SpaceRules } from '../types';
import {
  CreateGroupEvent,
  GroupMeta,
  GroupEventRawData,
  UpdateGroupEvent,
  MessageRawData,
  MessageEvent,
  MessageEventType,
  GroupEventType,
  LeaveGroupEvent,
  JoinGroupEvent,
  RequestEvent,
  RemoveEvent,
  RoleEvent,
  NotificationEvent,
  NotificationEventType,
  NotificationType,
  NOTIFICATION,
  ProposedEventNames,
  SpaceRequestEvent,
  SpaceRemoveEvent,
  VideoEventType,
  MessageOrigin,
  VideoEvent,
  GroupEventBase
} from './pushStreamTypes';
import { VideoCallStatus, VideoPeerInfo } from '../types';
import { VideoDataType } from '../video';
import { VIDEO_NOTIFICATION_ACCESS_TYPE } from '../payloads/constants';

export class DataModifier {
  public static handleChatGroupEvent(data: any, includeRaw = false): any {
    switch (data.eventType) {
      case 'create':
        return this.mapToCreateGroupEvent(data, includeRaw);
      case 'update':
        return this.mapToUpdateGroupEvent(data, includeRaw);
      case GroupEventType.JoinGroup:
        return this.mapToJoinGroupEvent(data, includeRaw);
      case GroupEventType.LeaveGroup:
        return this.mapToLeaveGroupEvent(data, includeRaw);
      case MessageEventType.Request:
        return this.mapToRequestEvent(data, includeRaw);
      case GroupEventType.Remove:
        return this.mapToRemoveEvent(data, includeRaw);
      case GroupEventType.RoleChange:
        return this.mapToRoleChangeEvent(data, includeRaw);
      default:
        console.warn('Unknown eventType:', data.eventType);
        return data;
    }
  }

  private static mapToJoinGroupEvent(
    data: any,
    includeRaw: boolean
  ): JoinGroupEvent {
    const baseEventData: JoinGroupEvent = {
      origin: data.messageOrigin,
      timestamp: data.timestamp,
      chatId: data.chatId,
      from: data.from,
      to: data.to,
      event: GroupEventType.JoinGroup,
    };

    return includeRaw
      ? {
          ...baseEventData,
          raw: { verificationProof: data.verificationProof },
        }
      : baseEventData;
  }

  private static mapToLeaveGroupEvent(
    data: any,
    includeRaw: boolean
  ): LeaveGroupEvent {
    const baseEventData: LeaveGroupEvent = {
      origin: data.messageOrigin,
      timestamp: data.timestamp,
      chatId: data.chatId,
      from: data.from,
      to: data.to,
      event: GroupEventType.LeaveGroup,
    };

    return includeRaw
      ? {
          ...baseEventData,
          raw: { verificationProof: data.verificationProof },
        }
      : baseEventData;
  }

  private static mapToRequestEvent(data: any, includeRaw: boolean): any {
    const eventData: RequestEvent = {
      origin: data.messageOrigin,
      timestamp: data.timestamp,
      chatId: data.chatId,
      from: data.from,
      to: data.to,
      event: MessageEventType.Request,
      meta: {
        group: data.isGroup || false,
      },
    };

    if (includeRaw) {
      eventData.raw = { verificationProof: data.verificationProof };
    }
    return eventData;
  }

  private static mapToRemoveEvent(data: any, includeRaw: boolean): any {
    // Whatever the structure of your RemoveEvent, modify accordingly
    const eventData: RemoveEvent = {
      origin: data.messageOrigin,
      timestamp: data.timestamp,
      chatId: data.chatId,
      from: data.from,
      to: data.to,
      event: GroupEventType.Remove,
    };

    if (includeRaw) {
      eventData.raw = { verificationProof: data.verificationProof };
    }
    return eventData;
  }

  private static mapToRoleChangeEvent(data: any, includeRaw: boolean): any {
    // Whatever the structure of your RemoveEvent, modify accordingly
    const eventData: RoleEvent = {
      origin: data.messageOrigin,
      timestamp: data.timestamp,
      chatId: data.chatId,
      from: data.from,
      to: data.to,
      newRole: data.newRole,
      event: GroupEventType.RoleChange,
    };

    if (includeRaw) {
      eventData.raw = { verificationProof: data.verificationProof };
    }
    return eventData;
  }

  private static buildChatGroupEventMetaAndRaw(
    incomingData: any,
    includeRaw: boolean
  ): {
    meta: GroupMeta;
    raw?: GroupEventRawData;
  } {
    const meta: GroupMeta = {
      name: incomingData.groupName,
      description: incomingData.groupDescription,
      image: incomingData.groupImage,
      owner: incomingData.groupCreator,
      private: !incomingData.isPublic,
      rules: incomingData.rules || {},
    };

    if (includeRaw) {
      const raw: GroupEventRawData = {
        verificationProof: incomingData.verificationProof,
      };
      return { meta, raw };
    }

    return { meta };
  }

  public static mapToGroupEvent(
    eventType: GroupEventType,
    incomingData: any,
    includeRaw: boolean
  ): CreateGroupEvent | UpdateGroupEvent {
    const { meta, raw } = this.buildChatGroupEventMetaAndRaw(
      incomingData,
      includeRaw
    );

    const groupEvent: GroupEventBase = {
      event: eventType,
      origin: incomingData.messageOrigin,
      timestamp: incomingData.timestamp,
      chatId: incomingData.chatId,
      from: incomingData.from,
      meta,
    };

    if (includeRaw) {
      groupEvent.raw = raw;
    }

    return groupEvent as CreateGroupEvent | UpdateGroupEvent;
  }

  public static mapToCreateGroupEvent(
    incomingData: any,
    includeRaw: boolean
  ): CreateGroupEvent {
    return this.mapToGroupEvent(
      GroupEventType.CreateGroup,
      incomingData,
      includeRaw
    ) as CreateGroupEvent;
  }

  public static mapToUpdateGroupEvent(
    incomingData: any,
    includeRaw: boolean
  ): UpdateGroupEvent {
    return this.mapToGroupEvent(
      GroupEventType.UpdateGroup,
      incomingData,
      includeRaw
    ) as UpdateGroupEvent;
  }

  public static mapToMessageEvent(
    data: any,
    includeRaw = false,
    eventType: MessageEventType
  ): MessageEvent {
    if (data.hasIntent === false && eventType === 'message') {
      eventType = MessageEventType.Request;
    }

    const messageEvent: MessageEvent = {
      event: eventType,
      origin: data.messageOrigin,
      timestamp: data.timestamp,
      chatId: data.chatId, // TODO: ChatId not working for w2w
      from: data.fromCAIP10,
      to: [data.toCAIP10], // TODO: Assuming 'to' is an array in MessageEvent. Update as necessary.
      message: {
        type: data.messageType,
        content: data.messageContent,
      },
      meta: {
        group: data.isGroup || false,
      },
      reference: data.cid,
    };

    if (includeRaw) {
      const rawData: MessageRawData = {
        fromCAIP10: data.fromCAIP10,
        toCAIP10: data.toCAIP10,
        fromDID: data.fromDID,
        toDID: data.toDID,
        encType: data.encType,
        encryptedSecret: data.encryptedSecret,
        signature: data.signature,
        sigType: data.sigType,
        verificationProof: data.verificationProof,
        previousReference: data.link,
      };
      messageEvent.raw = rawData;
    }

    return messageEvent;
  }

  public static handleChatEvent(data: any, includeRaw = false): any {
    if (!data) {
      console.error('Error in handleChatEvent: data is undefined or null');
      throw new Error('data is undefined or null');
    }

    const eventTypeMap: { [key: string]: MessageEventType } = {
      Chat: MessageEventType.Message,
      Request: MessageEventType.Request,
      Approve: MessageEventType.Accept,
      Reject: MessageEventType.Reject,
    };

    const key = data.eventType || data.messageCategory;

    if (!eventTypeMap[key]) {
      console.error(
        'Error in handleChatEvent: Invalid eventType or messageCategory',
        JSON.stringify(data)
      );
      throw new Error('Invalid eventType or messageCategory in data');
    }

    const eventType: MessageEventType = eventTypeMap[key];

    if (eventType) {
      return this.mapToMessageEvent(
        data,
        includeRaw,
        eventType as MessageEventType
      );
    } else {
      console.warn(
        'Unknown eventType:',
        data.eventType || data.messageCategory
      );
      return data;
    }
  }

  public static mapToNotificationEvent(
    data: any,
    notificationEventType: NotificationEventType,
    origin: 'other' | 'self',
    includeRaw = false
  ): NotificationEvent {
    const notificationType =
      (Object.keys(NOTIFICATION.TYPE) as NotificationType[]).find(
        (key) => NOTIFICATION.TYPE[key] === data.payload.data.type
      ) || 'BROADCAST'; // Assuming 'BROADCAST' as the default

    let recipients: string[];

    if (Array.isArray(data.payload.recipients)) {
      recipients = data.payload.recipients;
    } else if (typeof data.payload.recipients === 'string') {
      recipients = [data.payload.recipients];
    } else {
      recipients = Object.keys(data.payload.recipients);
    }

    const notificationEvent: NotificationEvent = {
      event: notificationEventType,
      origin: origin,
      timestamp: data.epoch,
      from: data.sender,
      to: recipients,
      notifID: data.payload_id.toString(),
      channel: {
        name: data.payload.data.app,
        icon: data.payload.data.icon,
        url: data.payload.data.url,
      },
      meta: {
        type: 'NOTIFICATION.' + notificationType,
      },
      message: {
        notification: {
          title: data.payload.notification.title,
          body: data.payload.notification.body,
        },
        payload: {
          title: data.payload.data.asub,
          body: data.payload.data.amsg,
          cta: data.payload.data.acta,
          embed: data.payload.data.aimg,
          meta: {
            domain: data.payload.data.additionalMeta?.domain || 'push.org',
            type: data.payload.data.additionalMeta?.type,
            data: data.payload.data.additionalMeta?.data,
          },
        },
      },
      config: {
        expiry: data.payload.data.etime,
        silent: data.payload.data.silent === '1',
        hidden: data.payload.data.hidden === '1',
      },
      source: data.source,
    };

    if (includeRaw) {
      notificationEvent.raw = {
        verificationProof: data.payload.verificationProof,
      };
    }

    return notificationEvent;
  }

  public static convertToProposedName(
    currentEventName: string
  ): ProposedEventNames {
    switch (currentEventName) {
      case 'message':
        return ProposedEventNames.Message;
      case 'request':
        return ProposedEventNames.Request;
      case 'accept':
        return ProposedEventNames.Accept;
      case 'reject':
        return ProposedEventNames.Reject;
      case 'leaveGroup':
        return ProposedEventNames.LeaveGroup;
      case 'joinGroup':
        return ProposedEventNames.JoinGroup;
      case 'createGroup':
        return ProposedEventNames.CreateGroup;
      case 'updateGroup':
        return ProposedEventNames.UpdateGroup;
      case 'remove':
        return ProposedEventNames.Remove;
      case 'roleChange':
        return ProposedEventNames.RoleChange;
      default:
        throw new Error(`Unknown current event name: ${currentEventName}`);
    }
  }

  public static convertToProposedNameForSpace(
    currentEventName: string
  ): ProposedEventNames {
    switch (currentEventName) {
      case 'create':
        return ProposedEventNames.CreateSpace;
      case 'update':
        return ProposedEventNames.UpdateSpace;
      case 'request':
        return ProposedEventNames.SpaceRequest;
      case 'accept':
        return ProposedEventNames.SpaceAccept;
      case 'reject':
        return ProposedEventNames.SpaceReject;
      case 'leaveSpace':
        return ProposedEventNames.LeaveSpace;
      case 'joinSpace':
        return ProposedEventNames.JoinSpace;
      case 'remove':
        return ProposedEventNames.SpaceRemove;
      case 'start':
        return ProposedEventNames.StartSpace;
      case 'stop':
        return ProposedEventNames.StopSpace;
      default:
        throw new Error(`Unknown current event name: ${currentEventName}`);
    }
  }

  public static handleToField(data: any): void {
    switch (data.event) {
      case ProposedEventNames.LeaveGroup:
      case ProposedEventNames.JoinGroup:
        data.to = null;
        break;

      case ProposedEventNames.Accept:
      case ProposedEventNames.Reject:
        if (data.meta?.group) {
          data.to = null;
        }
        break;

      default:
        break;
    }
  }

  public static handleSpaceEvent(data: any, includeRaw = false): any {
    // Check the eventType and map accordingly
    switch (data.eventType) {
      case 'create':
        return this.mapToCreateSpaceEvent(data, includeRaw);
      case 'update':
        return this.mapToUpdateSpaceEvent(data, includeRaw);
      case 'request':
        return this.mapToRequestSpaceEvent(data, includeRaw);
      case 'remove':
        return this.mapToRemoveSpaceEvent(data, includeRaw);
      case 'joinSpace':
        return this.mapToJoinSpaceEvent(data, includeRaw);
      case 'leaveSpace':
        return this.mapToLeaveSpaceEvent(data, includeRaw);
      case 'start':
        return this.mapToStartSpaceEvent(data, includeRaw);
      case 'stop':
        return this.mapToStopSpaceEvent(data, includeRaw);
      default:
        // If the eventType is unknown, check for known messageCategories
        switch (data.messageCategory) {
          case 'Approve':
            return this.mapToSpaceApproveEvent(data, includeRaw);

          case 'Reject':
            return this.mapToSpaceRejectEvent(data, includeRaw);
          // Add other cases as needed for different message categories
          default:
            console.warn(
              'Unknown eventType or messageCategory for space:',
              data.eventType,
              data.messageCategory
            );
            return data;
        }
    }
  }

  private static mapToCreateSpaceEvent(data: any, includeRaw: boolean): any {
    type BaseEventData = {
      event: string;
      origin: string;
      timestamp: number;
      spaceId: string;
      from: string;
      meta: {
        name: string;
        description: string;
        image: string;
        owner: string;
        private: boolean;
        rules: SpaceRules;
      };
      raw?: {
        verificationProof: string;
      };
    };

    const baseEventData: BaseEventData = {
      event: data.eventType,
      origin: data.messageOrigin,
      timestamp: data.timestamp,
      spaceId: data.spaceId,
      from: data.spaceCreator,
      meta: {
        name: data.spaceName,
        description: data.spaceDescription,
        image: data.spaceImage,
        owner: data.spaceCreator,
        private: !data.isPublic,
        rules: data.rules || {},
      },
    };

    if (includeRaw) {
      baseEventData.raw = {
        verificationProof: data.verificationProof || '',
      };
    }

    return baseEventData;
  }

  private static mapToUpdateSpaceEvent(data: any, includeRaw: boolean): any {
    type BaseEventData = {
      event: string;
      origin: string;
      timestamp: number;
      spaceId: string;
      from: string;
      meta: {
        name: string;
        description: string;
        image: string;
        owner: string;
        private: boolean;
        rules: SpaceRules;
      };
      raw?: {
        verificationProof: string;
      };
    };

    const baseEventData: BaseEventData = {
      event: data.eventType,
      origin: data.messageOrigin,
      timestamp: data.timestamp,
      spaceId: data.spaceId,
      from: data.spaceCreator,
      meta: {
        name: data.spaceName,
        description: data.spaceDescription,
        image: data.spaceImage,
        owner: data.spaceCreator,
        private: !data.isPublic,
        rules: data.rules || {},
      },
    };

    if (includeRaw) {
      baseEventData.raw = {
        verificationProof: data.verificationProof || '',
      };
    }

    return baseEventData;
  }

  private static mapToRequestSpaceEvent(data: any, includeRaw: boolean): any {
    const eventData: SpaceRequestEvent = {
      origin: data.messageOrigin,
      timestamp: data.timestamp,
      spaceId: data.spaceId,
      from: data.from,
      to: data.to,
      event: MessageEventType.Request,
    };

    if (includeRaw) {
      eventData.raw = { verificationProof: data.verificationProof };
    }
    return eventData;
  }

  private static mapToSpaceApproveEvent(data: any, includeRaw: boolean): any {
    type BaseEventData = {
      event: string;
      origin: string;
      timestamp: number;
      spaceId: any;
      from: any;
      to: any[];
      raw?: {
        verificationProof: string;
      };
    };

    const baseEventData: BaseEventData = {
      event: 'request',
      origin: data.messageOrigin === 'other' ? 'self' : 'other',
      timestamp: data.timestamp,
      spaceId: data.chatId,
      from: data.fromCAIP10,
      to: [data.toCAIP10],
    };

    if (includeRaw) {
      baseEventData.raw = {
        verificationProof: data.verificationProof || '',
      };
    }

    return baseEventData;
  }

  private static mapToSpaceRejectEvent(data: any, includeRaw: boolean): any {
    type BaseEventData = {
      event: string;
      origin: string;
      timestamp: number;
      spaceId: string;
      from: string;
      to: null;
      raw?: {
        verificationProof: string;
      };
    };

    const baseEventData: BaseEventData = {
      event: 'reject',
      origin: data.messageOrigin === 'other' ? 'other' : 'self',
      timestamp: data.timestamp,
      spaceId: data.chatId,
      from: data.fromCAIP10,
      to: null,
    };

    if (includeRaw) {
      baseEventData.raw = {
        verificationProof: data.verificationProof || '',
      };
    }

    return baseEventData;
  }

  private static mapToRemoveSpaceEvent(data: any, includeRaw: boolean): any {
    type BaseEventData = {
      event: string;
      origin: string;
      timestamp: number;
      spaceId: string;
      from: string;
      to: null;
      raw?: {
        verificationProof: string;
      };
    };

    const eventData: BaseEventData = {
      origin: data.messageOrigin,
      timestamp: data.timestamp,
      spaceId: data.spaceId,
      from: data.from,
      to: data.to,
      event: 'remove',
    };

    if (includeRaw) {
      eventData.raw = { verificationProof: data.verificationProof };
    }
    return eventData;
  }

  private static mapToJoinSpaceEvent(data: any, includeRaw: boolean): any {
    type BaseEventData = {
      event: string;
      origin: string;
      timestamp: number;
      spaceId: string;
      from: string;
      to: null;
      raw?: {
        verificationProof: string;
      };
    };

    const eventData: BaseEventData = {
      origin: data.messageOrigin,
      timestamp: data.timestamp,
      spaceId: data.spaceId,
      from: data.from,
      to: data.to,
      event: data.eventType,
    };

    if (includeRaw) {
      eventData.raw = { verificationProof: data.verificationProof };
    }
    return eventData;
  }

  private static mapToLeaveSpaceEvent(data: any, includeRaw: boolean): any {
    type BaseEventData = {
      event: string;
      origin: string;
      timestamp: number;
      spaceId: string;
      from: string;
      to: null;
      raw?: {
        verificationProof: string;
      };
    };

    const eventData: BaseEventData = {
      origin: data.messageOrigin,
      timestamp: data.timestamp,
      spaceId: data.spaceId,
      from: data.from,
      to: data.to,
      event: data.eventType,
    };

    if (includeRaw) {
      eventData.raw = { verificationProof: data.verificationProof };
    }
    return eventData;
  }

  private static mapToStartSpaceEvent(data: any, includeRaw: boolean): any {
    type BaseEventData = {
      event: string;
      origin: string;
      timestamp: number;
      spaceId: string;
      from: string;
      to: null;
      raw?: {
        verificationProof: string;
      };
    };

    const eventData: BaseEventData = {
      origin: data.messageOrigin,
      timestamp: data.timestamp,
      spaceId: data.spaceId,
      from: data.from,
      to: null,
      event: data.eventType,
    };

    if (includeRaw) {
      eventData.raw = { verificationProof: data.verificationProof };
    }
    return eventData;
  }

  private static mapToStopSpaceEvent(data: any, includeRaw: boolean): any {
    type BaseEventData = {
      event: string;
      origin: string;
      timestamp: number;
      spaceId: string;
      from: string;
      to: null;
      raw?: {
        verificationProof: string;
      };
    };

    const eventData: BaseEventData = {
      origin: data.messageOrigin,
      timestamp: data.timestamp,
      spaceId: data.spaceId,
      from: data.from,
      to: null,
      event: data.eventType,
    };

    if (includeRaw) {
      eventData.raw = { verificationProof: data.verificationProof };
    }
    return eventData;
  }

  public static convertToProposedNameForVideo(
    currentVideoStatus: VideoCallStatus
  ): VideoEventType {
    switch (currentVideoStatus) {
      case VideoCallStatus.INITIALIZED:
        return VideoEventType.REQUEST;
      case VideoCallStatus.RECEIVED:
        return VideoEventType.APPROVE;
      case VideoCallStatus.CONNECTED:
        return VideoEventType.CONNECT;
      case VideoCallStatus.ENDED:
        return VideoEventType.DISCONNECT;
      case VideoCallStatus.DISCONNECTED:
        return VideoEventType.DENY;
      case VideoCallStatus.RETRY_INITIALIZED:
        return VideoEventType.RETRY_REQUEST;
      case VideoCallStatus.RETRY_RECEIVED:
        return VideoEventType.RETRY_APPROVE;
      default:
        throw new Error(`Unknown video call status: ${currentVideoStatus}`);
    }
  }

  public static mapToVideoEvent(
    data: any,
    origin: MessageOrigin,
    includeRaw = false
  ): VideoEvent {
    const { senderAddress, signalData, status, chatId }: VideoDataType =
      JSON.parse(data.payload.data.additionalMeta?.data);

    // To maintain backward compatibility, if the rules object is not present in the payload,
    // we create a new rules object with chatId from additionalMeta.data
    const rules = data.payload.rules ?? {
      access: {
        type: VIDEO_NOTIFICATION_ACCESS_TYPE.PUSH_CHAT,
        data: {
          chatId,
        },
      },
    };

    const peerInfo: VideoPeerInfo = {
      address: senderAddress,
      signal: signalData,
      meta: {
        rules,
      },
    };

    const videoEventType: VideoEventType =
      DataModifier.convertToProposedNameForVideo(status);

    const videoEvent: VideoEvent = {
      event: videoEventType,
      origin: origin,
      timestamp: data.epoch,
      peerInfo,
    };

    if (includeRaw) {
      videoEvent.raw = {
        verificationProof: data.payload.verificationProof,
      };
    }

    return videoEvent;
  }
}
