import { EventEmitter } from 'events';
import { createSocketConnection, EVENTS } from '@pushprotocol/socket';
import { ENV, PACKAGE_BUILD } from '../constants';
import {
  GroupEventType,
  MessageEventType,
  NotificationEventType,
  PushStreamInitializeProps,
  STREAM,
} from './pushStreamTypes';
import { DataModifier } from './DataModifier';
import { pCAIP10ToWallet, walletToPCAIP10 } from '../helpers';
import { Chat } from '../pushapi/chat';
import { ProgressHookType, SignerType } from '../types';
import { ALPHA_FEATURE_CONFIG } from '../config';

export class PushStream extends EventEmitter {
  private pushChatSocket: any;
  private pushNotificationSocket: any;

  private account: string;
  private raw: boolean;
  private options: PushStreamInitializeProps;
  private chatInstance: Chat;
  private listen: STREAM[];

  constructor(
    account: string,
    private _listen: STREAM[],
    options: PushStreamInitializeProps,
    private decryptedPgpPvtKey?: string,
    private progressHook?: (progress: ProgressHookType) => void,
    private signer?: SignerType
  ) {
    super();

    this.account = account;

    this.raw = options.raw ?? false;
    this.options = options;
    this.listen = _listen;

    this.chatInstance = new Chat(
      this.account,
      this.options.env as ENV,
      ALPHA_FEATURE_CONFIG[PACKAGE_BUILD],
      this.decryptedPgpPvtKey,
      this.signer,
      this.progressHook
    );
  }

  static async initialize(
    account: string,
    listen: STREAM[],
    env: ENV,
    decryptedPgpPvtKey?: string,
    progressHook?: (progress: ProgressHookType) => void,
    signer?: SignerType,
    options?: PushStreamInitializeProps
  ): Promise<PushStream> {
    const defaultOptions: PushStreamInitializeProps = {
      raw: false,
      connection: {
        auto: true,
        retries: 3,
      },
      env: env,
    };

    if (!listen || listen.length === 0) {
      throw new Error(
        'The listen property must have at least one STREAM type.'
      );
    }

    const settings = {
      ...defaultOptions,
      ...options,
    };

    const accountToUse = settings.overrideAccount || account;

    const stream = new PushStream(
      accountToUse,
      listen,
      settings,
      decryptedPgpPvtKey,
      progressHook,
      signer
    );
    return stream;
  }

  public async connect(): Promise<void> {
    const shouldInitializeChatSocket =
      !this.listen ||
      this.listen.length === 0 ||
      this.listen.includes(STREAM.CHAT) ||
      this.listen.includes(STREAM.CHAT_OPS);
    const shouldInitializeNotifSocket =
      !this.listen ||
      this.listen.length === 0 ||
      this.listen.includes(STREAM.NOTIF) ||
      this.listen.includes(STREAM.NOTIF_OPS);

    let isChatSocketConnected = false;
    let isNotifSocketConnected = false;

    // Function to check and emit the STREAM.CONNECT event
    const checkAndEmitConnectEvent = () => {
      if (
        ((shouldInitializeChatSocket && isChatSocketConnected) ||
          !shouldInitializeChatSocket) &&
        ((shouldInitializeNotifSocket && isNotifSocketConnected) ||
          !shouldInitializeNotifSocket)
      ) {
        this.emit(STREAM.CONNECT);
        console.log('Emitted STREAM.CONNECT');
      }
    };

    const handleSocketDisconnection = async (socketType: 'chat' | 'notif') => {
      //console.log(`${socketType.toUpperCase()} Socket Disconnected`);

      if (socketType === 'chat') {
        isChatSocketConnected = false;
        if (isNotifSocketConnected) {
          if (
            this.pushNotificationSocket &&
            this.pushNotificationSocket.connected
          ) {
            //console.log('Disconnecting Notification Socket...');
            this.pushNotificationSocket.disconnect();
          }
        } else {
          // Emit STREAM.DISCONNECT only if the notification socket was already disconnected
          this.emit(STREAM.DISCONNECT);
          console.log('Emitted STREAM.DISCONNECT ');
        }
      } else if (socketType === 'notif') {
        isNotifSocketConnected = false;
        if (isChatSocketConnected) {
          if (this.pushChatSocket && this.pushChatSocket.connected) {
            //console.log('Disconnecting Chat Socket...');
            this.pushChatSocket.disconnect();
          }
        } else {
          // Emit STREAM.DISCONNECT only if the chat socket was already disconnected
          this.emit(STREAM.DISCONNECT);
          console.log('Emitted STREAM.DISCONNECT');
        }
      }
    };

    if (shouldInitializeChatSocket) {
      if (!this.pushChatSocket) {
        // If pushChatSocket does not exist, create a new socket connection
        this.pushChatSocket = createSocketConnection({
          user: walletToPCAIP10(this.account),
          socketType: 'chat',
          socketOptions: {
            autoConnect: this.options?.connection?.auto ?? true,
            reconnectionAttempts: this.options?.connection?.retries ?? 3,
          },
          env: this.options?.env as ENV,
        });

        if (!this.pushChatSocket) {
          throw new Error('Push chat socket not connected');
        }
      } else if (!this.pushChatSocket.connected) {
        // If pushChatSocket exists but is not connected, attempt to reconnect
        console.log('Attempting to reconnect push chat socket...');
        this.pushChatSocket.connect(); // Assuming connect() is the method to re-establish connection
      } else {
        // If pushChatSocket is already connected
        console.log('Push chat socket already connected');
      }
    }

    if (shouldInitializeNotifSocket) {
      if (!this.pushNotificationSocket) {
        // If pushNotificationSocket does not exist, create a new socket connection
        this.pushNotificationSocket = createSocketConnection({
          user: pCAIP10ToWallet(this.account),
          env: this.options?.env as ENV,
          socketOptions: {
            autoConnect: this.options?.connection?.auto ?? true,
            reconnectionAttempts: this.options?.connection?.retries ?? 3,
          },
        });

        if (!this.pushNotificationSocket) {
          throw new Error('Push notification socket not connected');
        }
      } else if (!this.pushNotificationSocket.connected) {
        // If pushNotificationSocket exists but is not connected, attempt to reconnect
        console.log('Attempting to reconnect push notification socket...');
        this.pushNotificationSocket.connect(); // Assuming connect() is the method to re-establish connection
      } else {
        // If pushNotificationSocket is already connected
        console.log('Push notification socket already connected');
      }
    }

    const shouldEmit = (eventType: STREAM): boolean => {
      if (!this.listen || this.listen.length === 0) {
        return true;
      }
      return this.listen.includes(eventType);
    };

    if (this.pushChatSocket) {
      this.pushChatSocket.on(EVENTS.CONNECT, async () => {
        isChatSocketConnected = true;
        checkAndEmitConnectEvent();
        console.log(`Chat Socket Connected (ID: ${this.pushChatSocket.id})`);
      });

      this.pushChatSocket.on(EVENTS.DISCONNECT, async () => {
        await handleSocketDisconnection('chat');
        //console.log(`Chat Socket Disconnected`);
      });

      this.pushChatSocket.on(EVENTS.CHAT_GROUPS, (data: any) => {
        try {
          const modifiedData = DataModifier.handleChatGroupEvent(
            data,
            this.raw
          );
          modifiedData.event = DataModifier.convertToProposedName(
            modifiedData.event
          );
          DataModifier.handleToField(modifiedData);
          if (this.shouldEmitChat(data.chatId)) {
            if (
              data.eventType === GroupEventType.JoinGroup ||
              data.eventType === GroupEventType.LeaveGroup ||
              data.eventType === MessageEventType.Request ||
              data.eventType === GroupEventType.Remove
            ) {
              if (shouldEmit(STREAM.CHAT)) {
                this.emit(STREAM.CHAT, modifiedData);
              }
            } else {
              if (shouldEmit(STREAM.CHAT_OPS)) {
                this.emit(STREAM.CHAT_OPS, modifiedData);
              }
            }
          }
        } catch (error) {
          console.error(
            'Error handling CHAT_GROUPS event:',
            error,
            'Data:',
            data
          );
        }
      });

      this.pushChatSocket.on(
        EVENTS.CHAT_RECEIVED_MESSAGE,
        async (data: any) => {
          try {
            if (
              data.messageCategory == 'Chat' ||
              data.messageCategory == 'Request'
            ) {
              // Dont call this if read only mode ?
              if (this.signer) {
                data = await this.chatInstance.decrypt([data]);
                data = data[0];
              }
            }

            const modifiedData = DataModifier.handleChatEvent(data, this.raw);
            modifiedData.event = DataModifier.convertToProposedName(
              modifiedData.event
            );
            DataModifier.handleToField(modifiedData);
            if (this.shouldEmitChat(data.chatId)) {
              if (shouldEmit(STREAM.CHAT)) {
                this.emit(STREAM.CHAT, modifiedData);
              }
            }
          } catch (error) {
            console.error(
              'Error handling CHAT_RECEIVED_MESSAGE event:',
              error,
              'Data:',
              data
            );
          }
        }
      );
    }

    if (this.pushNotificationSocket) {
      this.pushNotificationSocket.on(EVENTS.CONNECT, async () => {
        console.log(
          `Notification Socket Connected (ID: ${this.pushNotificationSocket.id})`
        );
        isNotifSocketConnected = true;
        checkAndEmitConnectEvent();
      });

      this.pushNotificationSocket.on(EVENTS.DISCONNECT, async () => {
        await handleSocketDisconnection('notif');
        //console.log(`Notification Socket Disconnected`);
      });

      this.pushNotificationSocket.on(EVENTS.USER_FEEDS, (data: any) => {
        try {
          const modifiedData = DataModifier.mapToNotificationEvent(
            data,
            NotificationEventType.INBOX,
            this.account === data.sender ? 'self' : 'other',
            this.raw
          );

          if (this.shouldEmitChannel(modifiedData.from)) {
            if (shouldEmit(STREAM.NOTIF)) {
              this.emit(STREAM.NOTIF, modifiedData);
            }
          }
        } catch (error) {
          console.error(
            'Error handling USER_FEEDS event:',
            error,
            'Data:',
            data
          );
        }
      });

      this.pushNotificationSocket.on(EVENTS.USER_SPAM_FEEDS, (data: any) => {
        try {
          const modifiedData = DataModifier.mapToNotificationEvent(
            data,
            NotificationEventType.SPAM,
            this.account === data.sender ? 'self' : 'other',
            this.raw
          );
          modifiedData.origin =
            this.account === modifiedData.from ? 'self' : 'other';
          if (this.shouldEmitChannel(modifiedData.from)) {
            if (shouldEmit(STREAM.NOTIF)) {
              this.emit(STREAM.NOTIF, modifiedData);
            }
          }
        } catch (error) {
          console.error(
            'Error handling USER_SPAM_FEEDS event:',
            error,
            'Data:',
            data
          );
        }
      });
    }
  }

  public async disconnect(): Promise<void> {
    // Disconnect push chat socket if connected
    if (this.pushChatSocket) {
      this.pushChatSocket.disconnect();
      //console.log('Push chat socket disconnected.');
    }

    // Disconnect push notification socket if connected
    if (this.pushNotificationSocket) {
      this.pushNotificationSocket.disconnect();
      //console.log('Push notification socket disconnected.');
    }
  }

  private shouldEmitChat(dataChatId: string): boolean {
    if (
      !this.options.filter?.chats ||
      this.options.filter.chats.length === 0 ||
      this.options.filter.chats.includes('*')
    ) {
      return true;
    }
    return this.options.filter.chats.includes(dataChatId);
  }

  private shouldEmitChannel(dataChannelId: string): boolean {
    if (
      !this.options.filter?.channels ||
      this.options.filter.channels.length === 0 ||
      this.options.filter.channels.includes('*')
    ) {
      return true;
    }
    return this.options.filter.channels.includes(dataChannelId);
  }
}
