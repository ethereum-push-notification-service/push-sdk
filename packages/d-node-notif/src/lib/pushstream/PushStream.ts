import { EventEmitter } from 'events';
import { createSocketConnection } from './socketClient';
import { ENV } from '../constants';
import {
  NotificationEventType,
  PushStreamInitializeProps,
  STREAM,
  EVENTS,
} from './pushStreamTypes';
import { DataModifier } from './DataModifier';
import { pCAIP10ToWallet } from '../helpers';
import { ProgressHookType, SignerType } from '../types';
import { ALPHA_FEATURE_CONFIG } from '../config';
import { ADDITIONAL_META_TYPE } from '../payloads';
import { v4 as uuidv4 } from 'uuid';

export type StreamType = STREAM | '*';
export class PushStream extends EventEmitter {
  private pushNotificationSocket: any;

  private account: string;
  private raw: boolean;
  private options: PushStreamInitializeProps;
  private listen: StreamType[];
  private disconnected: boolean;
  public uid: string;
  public notifSocketCount: number;
  public notifSocketConnected: boolean;
  constructor(
    account: string,
    private _listen: StreamType[],
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
    this.disconnected = false;
    this.uid = uuidv4();
    this.notifSocketCount = 0;
    this.notifSocketConnected = false;
  }

  static async initialize(
    account: string,
    listen: StreamType[],
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

    if (listen.includes('*')) {
      listen = Object.values(STREAM);
    }

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

  public async reinit(
    listen: STREAM[],
    newOptions: PushStreamInitializeProps
  ): Promise<void> {
    this.uid = uuidv4();
    this.listen = listen;
    this.options = { ...this.options, ...newOptions };
    await this.disconnect();
    await this.connect();
  }

  public async connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      (async () => {
        const shouldInitializeNotifSocket =
          !this.listen ||
          this.listen.length === 0 ||
          this.listen.includes(STREAM.NOTIF) ||
          this.listen.includes(STREAM.NOTIF_OPS);

        let isNotifSocketConnected = false;
        // Function to check and emit the STREAM.CONNECT event
        const checkAndEmitConnectEvent = () => {
          if (
            (shouldInitializeNotifSocket && isNotifSocketConnected) ||
            !shouldInitializeNotifSocket
          ) {
            this.emit(STREAM.CONNECT);
            console.log(
              'RestAPI::PushStream::connect - Emitted STREAM.CONNECT'
            );
            resolve();
          }
        };

        const TIMEOUT_DURATION = 5000; // Timeout duration in milliseconds
        setTimeout(() => {
          if (!this.notifSocketConnected) {
            reject(new Error('Connection timeout')); // Reject the promise if connect event is not emitted within the timeout
          }
        }, TIMEOUT_DURATION);

        const handleSocketDisconnection = async (socketType: 'notif') => {
          if (socketType === 'notif') {
            isNotifSocketConnected = false;
            this.notifSocketConnected = false;
            this.notifSocketCount--;
            this.emit(STREAM.DISCONNECT);
            console.log(
              'RestAPI::PushStream::handleSocketDisconnection - Emitted STREAM.DISCONNECT for notification.'
            );
          }
        };

        if (shouldInitializeNotifSocket) {
          if (!this.pushNotificationSocket) {
            // If pushNotificationSocket does not exist, create a new socket connection
            console.log(
              'RestAPI::PushStream::NotifSocket::Create - pushNotificationSocket does not exist, creating new socket connection...'
            );
            this.pushNotificationSocket = await createSocketConnection({
              user: pCAIP10ToWallet(this.account),
              env: this.options?.env as ENV,
              socketOptions: {
                autoConnect: this.options?.connection?.auto ?? true,
                reconnectionAttempts: this.options?.connection?.retries ?? 3,
              },
            });

            if (!this.pushNotificationSocket) {
              reject(
                new Error(
                  'RestAPI::PushStream::NotifSocket::Error - Push notification socket not connected'
                )
              );
            }
          } else if (
            this.pushNotificationSocket &&
            !this.notifSocketConnected
          ) {
            // If pushNotificationSocket exists but is not connected, attempt to reconnect
            console.log(
              'RestAPI::PushStream::NotifSocket::Reconnect - Attempting to reconnect push notification socket...'
            );
            this.notifSocketCount++;
            this.pushNotificationSocket.connect(); // Assuming connect() is the method to re-establish connection
          } else {
            // If pushNotificationSocket is already connected
            console.log(
              'RestAPI::PushStream::NotifSocket::Status - Push notification socket already connected'
            );
          }
        }

        const shouldEmit = (eventType: STREAM): boolean => {
          if (!this.listen || this.listen.length === 0) {
            return true;
          }
          return this.listen.includes(eventType);
        };

        if (this.pushNotificationSocket) {
          this.pushNotificationSocket.on(EVENTS.CONNECT, async () => {
            console.log(
              `RestAPI::PushStream::NotifSocket::Connect - Notification Socket Connected (ID: ${this.pushNotificationSocket.id})`
            );
            isNotifSocketConnected = true;
            this.notifSocketCount++;
            this.notifSocketConnected = true;
            checkAndEmitConnectEvent();
          });

          this.pushNotificationSocket.on(EVENTS.DISCONNECT, async () => {
            console.log(
              'RestAPI::PushStream::NotifSocket::Disconnect - Notification socket disconnected.'
            );
            await handleSocketDisconnection('notif');
          });

          this.pushNotificationSocket.on(EVENTS.USER_FEEDS, (data: any) => {
            try {
              if (
                data.payload.data.additionalMeta?.type ===
                `${ADDITIONAL_META_TYPE.PUSH_VIDEO}+1`
              ) {
                // VIDEO NOTIF NOT IMPLEMENTED
              } else {
                // Channel Notification
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
              }
            } catch (error) {
              console.error(
                `RestAPI::PushStream::NotifSocket::UserFeeds::Error - Error handling event: ${error}, Data: ${JSON.stringify(
                  data
                )}`
              );
            }
          });

          this.pushNotificationSocket.on(
            EVENTS.USER_SPAM_FEEDS,
            (data: any) => {
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
            }
          );
        }

        this.disconnected = false;
      })();
    });
  }

  public connected(): boolean {
    // Log the connection status of both sockets with detailed prefix
    console.log(
      `RestAPI::PushStream::connected::Notification Socket Connected: ${this.notifSocketConnected}`
    );
    return this.notifSocketConnected;
  }

  public async disconnect(): Promise<void> {
    // Disconnect push notification socket if connected
    if (this.pushNotificationSocket && this.notifSocketConnected) {
      this.pushNotificationSocket.disconnect();
      console.log(
        'RestAPI::PushStream::disconnect::Push notification socket disconnected.'
      );
    }
  }

  public info() {
    return {
      options: this.options,
      listen: this.listen,
    };
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
