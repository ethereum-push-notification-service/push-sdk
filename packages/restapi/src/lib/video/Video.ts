// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as Peer from 'simple-peer';
import { produce } from 'immer';

import Constants, { ENV } from '../constants';
import sendVideoCallNotification from './helpers/sendVideoCallNotification';
import {
  endStream,
  restartAudioStream,
  restartVideoStream,
  stopAudioStream,
  stopVideoStream,
} from './helpers/mediaToggle';
import isJSON from './helpers/isJSON';
import { getIceServerConfig } from './helpers/getIceServerConfig';

import {
  SignerType,
  VideoCallData,
  VideoCreateInputOptions,
  VideoRequestInputOptions,
  VideoAcceptRequestInputOptions,
  VideoConnectInputOptions,
  VideoCallStatus,
  EnableAudioInputOptions,
  EnableVideoInputOptions,
  VideoDisconnectOptions,
} from '../types';
import getIncomingIndexFromAddress from './helpers/getIncomingIndexFromAddress';
import getConnectedAddresses from './helpers/getConnectedAddresses';
import getConnectToAddresses from './helpers/getConnectToAddresses';
import {
  SPACE_DISCONNECT_TYPE,
  SPACE_REQUEST_TYPE,
  VIDEO_CALL_TYPE,
} from '../payloads/constants';

export const initVideoCallData: VideoCallData = {
  meta: {
    chatId: '',
    initiator: {
      address: '',
      signal: null,
    },
    broadcast: {
      livepeerInfo: null,
      hostAddress: '',
      coHostAddress: '',
    },
  },
  local: {
    stream: null,
    audio: null,
    video: null,
    address: '',
  },
  // TODO: Remove the default element in incoming array
  incoming: [
    {
      stream: null,
      audio: null,
      video: null,
      address: '',
      status: VideoCallStatus.UNINITIALIZED,
      retryCount: 0,
    },
  ],
};

export class Video {
  // user, call related info
  protected signer: SignerType;
  protected chainId: number;
  protected pgpPrivateKey: string;
  protected env: ENV;
  protected callType: VIDEO_CALL_TYPE;
  protected onReceiveStream: (
    receivedStream: MediaStream,
    senderAddress: string,
    audio: boolean | null
  ) => Promise<void>;

  // storing the peer instance
  private peerInstances: {
    [key: string]: any;
  } = {};

  protected data: VideoCallData;
  setData: (fn: (data: VideoCallData) => VideoCallData) => void;

  constructor({
    signer,
    chainId,
    pgpPrivateKey,
    env = Constants.ENV.PROD,
    setData,
    callType = VIDEO_CALL_TYPE.PUSH_VIDEO,
    onReceiveStream = async () => {
      return Promise.resolve();
    },
  }: {
    signer: SignerType;
    chainId: number;
    pgpPrivateKey: string;
    setData: (fn: (data: VideoCallData) => VideoCallData) => void;
    env?: ENV;
    callType?: VIDEO_CALL_TYPE;
    onReceiveStream?: (
      receivedStream: MediaStream,
      senderAddress: string,
      audio: boolean | null
    ) => Promise<void>;
  }) {
    this.signer = signer;
    this.chainId = chainId;
    this.pgpPrivateKey = pgpPrivateKey;
    this.env = env;
    this.callType = callType;
    this.onReceiveStream = onReceiveStream;

    // init the react state
    setData(() => initVideoCallData);

    // init the class variable
    this.data = initVideoCallData;

    // set the state updating function
    this.setData = function (fn) {
      // update the react state
      setData(fn);

      // update the class variable
      this.data = fn(this.data);
    };
  }

  async create(options: VideoCreateInputOptions): Promise<void> {
    const { audio = true, video = true, stream = null } = options || {};

    try {
      const localStream =
        stream !== null
          ? stream // for backend
          : await navigator.mediaDevices.getUserMedia({
              // for frontend
              video,
              audio,
            });

      this.setData((oldData) => {
        return produce(oldData, (draft) => {
          draft.local.stream = localStream;
          draft.local.video = video;
          draft.local.audio = audio;
        });
      });
    } catch (err) {
      console.error('error in create', err);
    }
  }

  async request(options: VideoRequestInputOptions): Promise<void> {
    const {
      senderAddress,
      recipientAddress,
      chatId,
      rules,
      onReceiveMessage,
      retry = false,
      details,
    } = options || {};

    const recipientAddresses = Array.isArray(recipientAddress)
      ? recipientAddress
      : [recipientAddress];

    for (const recipientAddress of recipientAddresses) {
      try {
        // set videoCallInfo state with status 1 (call initiated)
        this.setData((oldData) => {
          return produce(oldData, (draft) => {
            draft.local.address = senderAddress;
            draft.meta.chatId = chatId ?? rules!.access.data;
            draft.meta.initiator.address = senderAddress;

            const incomingIndex = getIncomingIndexFromAddress(
              oldData.incoming,
              recipientAddress
            );

            if (incomingIndex === -1) {
              draft.incoming.push({
                stream: null,
                audio: null,
                video: null,
                address: recipientAddress,
                status: retry
                  ? VideoCallStatus.RETRY_INITIALIZED
                  : VideoCallStatus.INITIALIZED,
                retryCount: retry ? 1 : 0,
              });
            } else {
              draft.incoming[incomingIndex].address = recipientAddress;
              draft.incoming[incomingIndex].status = retry
                ? VideoCallStatus.RETRY_INITIALIZED
                : VideoCallStatus.INITIALIZED;
              draft.incoming[incomingIndex].retryCount += retry ? 1 : 0;
            }
          });
        });

        // fetching the iceServers config
        const iceServerConfig = await getIceServerConfig(this.env);
        this.peerInstances[recipientAddress] = new Peer({
          initiator: true,
          trickle: false,
          stream: this.data.local.stream,
          config: {
            iceServers: iceServerConfig,
          },
        });

        this.peerInstances[recipientAddress].on('signal', (data: any) => {
          this.setData((oldData) => {
            return produce(oldData, (draft) => {
              draft.meta.initiator.signal = data;
            });
          });

          // sending notification to the recipientAddress with video call signaling data
          sendVideoCallNotification(
            {
              signer: this.signer,
              chainId: this.chainId,
              pgpPrivateKey: this.pgpPrivateKey,
            },
            {
              senderAddress,
              recipientAddress,
              status: retry
                ? VideoCallStatus.RETRY_INITIALIZED
                : VideoCallStatus.INITIALIZED,
              chatId,
              rules,
              signalData: data,
              env: this.env,
              callType: this.callType,
              callDetails: details,
            }
          );
        });

        this.peerInstances[recipientAddress].on('connect', () => {
          this.peerInstances[recipientAddress].send(
            `initial message from ${senderAddress}`
          );
          this.peerInstances[recipientAddress].send(
            JSON.stringify({
              type: 'isVideoOn',
              value: this.data.local.video,
            })
          );
          this.peerInstances[recipientAddress].send(
            JSON.stringify({
              type: 'isAudioOn',
              value: this.data.local.audio,
            })
          );
          // send the addresses the local peer is connected to remote peer
          const connectedAddresses = getConnectedAddresses({
            incomingPeers: this.data.incoming,
          });
          this.peerInstances[recipientAddress].send(
            JSON.stringify({
              type: 'connectedAddresses',
              value: connectedAddresses,
            })
          );
        });

        this.peerInstances[recipientAddress].on('data', (data: any) => {
          if (isJSON(data)) {
            const parsedData = JSON.parse(data);

            if (parsedData.type === 'connectedAddresses') {
              const receivedConnectedAddresses = parsedData.value;
              const localConnectedAddresses = getConnectedAddresses({
                incomingPeers: this.data.incoming,
              });

              // find out the address to which local peer is not connected to but the remote peer is
              // then connect with them
              const connectToAddresses = getConnectToAddresses({
                localAddress: senderAddress,
                localConnectedAddresses,
                receivedConnectedAddresses,
              });
              this.request({
                senderAddress,
                recipientAddress: connectToAddresses,
                chatId,
                rules,
                details: {
                  type: SPACE_REQUEST_TYPE.ESTABLISH_MESH,
                  data: {},
                },
              });
            }

            if (parsedData.type === 'isVideoOn') {
              this.setData((oldData) => {
                return produce(oldData, (draft) => {
                  const incomingIndex = getIncomingIndexFromAddress(
                    oldData.incoming,
                    recipientAddress
                  );
                  draft.incoming[incomingIndex].video = parsedData.value;
                });
              });
            }

            if (parsedData.type === 'isAudioOn') {
              this.setData((oldData) => {
                return produce(oldData, (draft) => {
                  const incomingIndex = getIncomingIndexFromAddress(
                    oldData.incoming,
                    recipientAddress
                  );
                  draft.incoming[incomingIndex].audio = parsedData.value;
                });
              });
            }

            if (parsedData.type === 'endCall') {
              if (
                this.callType === VIDEO_CALL_TYPE.PUSH_SPACE &&
                parsedData?.details?.type === SPACE_DISCONNECT_TYPE.LEAVE
              ) {
                // destroy connection to only the current peer
                this.peerInstances[recipientAddress]?.destroy();
                this.peerInstances[recipientAddress] = null;
                this.setData((oldData) => {
                  return produce(oldData, (draft) => {
                    const incomingIndex = getIncomingIndexFromAddress(
                      oldData.incoming,
                      recipientAddress
                    );
                    draft.incoming.splice(incomingIndex, 1);
                  });
                });
              }
              if (
                this.callType === VIDEO_CALL_TYPE.PUSH_SPACE &&
                parsedData?.details?.type === SPACE_DISCONNECT_TYPE.STOP
              ) {
                // destroy connection to all the peers
                for (const connectedAddress in this.peerInstances) {
                  this.peerInstances[connectedAddress]?.destroy();
                  this.peerInstances[connectedAddress] = null;
                }

                // destroy the local stream
                if (this.data.local.stream) {
                  endStream(this.data.local.stream);
                }

                // reset the state
                this.setData(() => initVideoCallData);
              }

              if (this.callType === VIDEO_CALL_TYPE.PUSH_VIDEO) {
                this.peerInstances[recipientAddress]?.destroy();
                this.peerInstances[recipientAddress] = null;

                // destroy the local stream
                if (this.data.local.stream) {
                  endStream(this.data.local.stream);
                }

                // reset the state
                this.setData(() => initVideoCallData);
              }
            }
          } else if(onReceiveMessage) {
            onReceiveMessage(data);
          }
        });

        this.peerInstances[recipientAddress].on(
          'stream',
          (currentStream: MediaStream) => {
            const incomingIndex = getIncomingIndexFromAddress(
              this.data.incoming,
              recipientAddress
            );
            this.onReceiveStream(
              currentStream,
              recipientAddress,
              this.data.incoming[incomingIndex].audio
            );
            this.setData((oldData) => {
              return produce(oldData, (draft) => {
                draft.incoming[incomingIndex].stream = currentStream;
              });
            });
          }
        );
      } catch (err) {
        console.error('error in request', err);
      }
    }
  }

  async acceptRequest(options: VideoAcceptRequestInputOptions): Promise<void> {
    const {
      signalData,
      senderAddress,
      recipientAddress,
      chatId,
      rules,
      onReceiveMessage,
      retry = false,
      details,
    } = options || {};

    try {
      // if peerInstance is not null -> acceptRequest/request was called before
      if (this.peerInstances[recipientAddress]) {
        // to prevent connection error we stop the exec of acceptRequest
        return Promise.resolve();
      }

      // fetching the iceServers config
      const iceServerConfig = await getIceServerConfig(this.env);

      // creating peer instance
      this.peerInstances[recipientAddress] = new Peer({
        initiator: false,
        trickle: false,
        stream: this.data.local.stream,
        config: {
          iceServers: iceServerConfig,
        },
      });

      // set videoCallInfo state with status 2 (call received)
      this.setData((oldData) => {
        return produce(oldData, (draft) => {
          draft.local.address = senderAddress;
          draft.meta.chatId = chatId ?? rules!.access.data;
          draft.meta.initiator.address = senderAddress;

          const incomingIndex = getIncomingIndexFromAddress(
            oldData.incoming,
            recipientAddress
          );

          if (incomingIndex === -1) {
            draft.incoming.push({
              stream: null,
              audio: null,
              video: null,
              address: recipientAddress,
              status: retry
                ? VideoCallStatus.RETRY_INITIALIZED
                : VideoCallStatus.INITIALIZED,
              retryCount: retry ? 1 : 0,
            });
          } else {
            draft.incoming[incomingIndex].address = recipientAddress;
            draft.incoming[incomingIndex].status = retry
              ? VideoCallStatus.RETRY_RECEIVED
              : VideoCallStatus.RECEIVED;
            draft.incoming[incomingIndex].retryCount += retry ? 1 : 0;
          }
        });
      });

      // setup error handler
      this.peerInstances[recipientAddress].on('error', (err: any) => {
        if (this.data.incoming[0].retryCount >= 5) {
          this.disconnect({ peerAddress: recipientAddress });
        }

        // retrying in case of connection error
        sendVideoCallNotification(
          {
            signer: this.signer,
            chainId: this.chainId,
            pgpPrivateKey: this.pgpPrivateKey,
          },
          {
            senderAddress,
            recipientAddress,
            status: VideoCallStatus.RETRY_INITIALIZED,
            chatId,
            rules,
            signalData: null,
            callType: this.callType,
            env: this.env,
          }
        );
      });

      this.peerInstances[recipientAddress].signal(signalData);

      this.peerInstances[recipientAddress].on('signal', (data: any) => {
        this.setData((oldData) => {
          return produce(oldData, (draft) => {
            draft.meta.initiator.signal = data;
          });
        });

        sendVideoCallNotification(
          {
            signer: this.signer,
            chainId: this.chainId,
            pgpPrivateKey: this.pgpPrivateKey,
          },
          {
            senderAddress,
            recipientAddress,
            status: retry
              ? VideoCallStatus.RETRY_RECEIVED
              : VideoCallStatus.RECEIVED,
            chatId,
            rules,
            signalData: data,
            env: this.env,
            callType: this.callType,
            callDetails: details,
          }
        );
      });

      this.peerInstances[recipientAddress].on('connect', () => {
        this.peerInstances[recipientAddress].send(
          JSON.stringify({
            type: 'isVideoOn',
            value: this.data.local.video,
          })
        );
        this.peerInstances[recipientAddress].send(
          JSON.stringify({
            type: 'isAudioOn',
            value: this.data.local.audio,
          })
        );

        // send the addresses the local peer is connected to remote peer
        const connectedAddresses = getConnectedAddresses({
          incomingPeers: this.data.incoming,
        });
        this.peerInstances[recipientAddress].send(
          JSON.stringify({
            type: 'connectedAddresses',
            value: connectedAddresses,
          })
        );

        // set videoCallInfo state with status connected for the receiver's end
        this.setData((oldData) => {
          return produce(oldData, (draft) => {
            const incomingIndex = getIncomingIndexFromAddress(
              oldData.incoming,
              recipientAddress
            );
            draft.incoming[incomingIndex].status = VideoCallStatus.CONNECTED;
          });
        });
      });

      this.peerInstances[recipientAddress].on('data', (data: any) => {
        if (isJSON(data)) {
          const parsedData = JSON.parse(data);

          if (parsedData.type === 'connectedAddresses') {
            const receivedConnectedAddresses = parsedData.value;
            const localConnectedAddresses = getConnectedAddresses({
              incomingPeers: this.data.incoming,
            });

            // find out the address to which local peer is not connected to but the remote peer is
            // then connect with them
            const connectToAddresses = getConnectToAddresses({
              localAddress: senderAddress,
              localConnectedAddresses,
              receivedConnectedAddresses,
            });
            this.request({
              senderAddress,
              recipientAddress: connectToAddresses,
              chatId,
              rules,
              details: {
                type: SPACE_REQUEST_TYPE.ESTABLISH_MESH,
                data: {},
              },
            });
          }

          if (parsedData.type === 'isVideoOn') {
            this.setData((oldData) => {
              return produce(oldData, (draft) => {
                const incomingIndex = getIncomingIndexFromAddress(
                  oldData.incoming,
                  recipientAddress
                );
                draft.incoming[incomingIndex].video = parsedData.value;
              });
            });
          }

          if (parsedData.type === 'isAudioOn') {
            this.setData((oldData) => {
              return produce(oldData, (draft) => {
                const incomingIndex = getIncomingIndexFromAddress(
                  oldData.incoming,
                  recipientAddress
                );
                draft.incoming[incomingIndex].audio = parsedData.value;
              });
            });
          }

          if (parsedData.type === 'endCall') {
            if (
              this.callType === VIDEO_CALL_TYPE.PUSH_SPACE &&
              parsedData?.details?.type === SPACE_DISCONNECT_TYPE.LEAVE
            ) {
              // destroy connection to only the current peer
              this.peerInstances[recipientAddress]?.destroy();
              this.peerInstances[recipientAddress] = null;
              this.setData((oldData) => {
                return produce(oldData, (draft) => {
                  const incomingIndex = getIncomingIndexFromAddress(
                    oldData.incoming,
                    recipientAddress
                  );
                  draft.incoming.splice(incomingIndex, 1);
                });
              });
            }
            if (
              this.callType === VIDEO_CALL_TYPE.PUSH_SPACE &&
              parsedData?.details?.type === SPACE_DISCONNECT_TYPE.STOP
            ) {
              // destroy connection to all the peers
              for (const connectedAddress in this.peerInstances) {
                this.peerInstances[connectedAddress]?.destroy();
                this.peerInstances[connectedAddress] = null;
              }

              // destroy the local stream
              if (this.data.local.stream) {
                endStream(this.data.local.stream);
              }

              // reset the state
              this.setData(() => initVideoCallData);
            }

            if (this.callType === VIDEO_CALL_TYPE.PUSH_VIDEO) {
              this.peerInstances[recipientAddress]?.destroy();
              this.peerInstances[recipientAddress] = null;

              // destroy the local stream
              if (this.data.local.stream) {
                endStream(this.data.local.stream);
              }

              // reset the state
              this.setData(() => initVideoCallData);
            }
          }
        } else if(onReceiveMessage) {
          onReceiveMessage(data);
        }
      });

      this.peerInstances[recipientAddress].on(
        'stream',
        (currentStream: MediaStream) => {
          const incomingIndex = getIncomingIndexFromAddress(
            this.data.incoming,
            recipientAddress
          );
          this.onReceiveStream(
            currentStream,
            recipientAddress,
            this.data.incoming[incomingIndex].audio
          );
          this.setData((oldData) => {
            return produce(oldData, (draft) => {
              draft.incoming[incomingIndex].stream = currentStream;
            });
          });
        }
      );
    } catch (err) {
      console.error('error in accept request', err);
    }
  }

  connect(options: VideoConnectInputOptions): void {
    const { peerAddress, signalData } = options || {};

    try {
      if (!peerAddress) {
        console.warn('disconnect requires a peer address');
      }

      // setup error handler
      this.peerInstances[
        peerAddress ? peerAddress : this.data.incoming[0].address
      ].on('error', (err: any) => {
        const incomingIndex = peerAddress
          ? getIncomingIndexFromAddress(this.data.incoming, peerAddress)
          : 0;

        if (this.data.incoming[incomingIndex].retryCount >= 5) {
          this.disconnect({
            peerAddress: peerAddress
              ? peerAddress
              : this.data.incoming[0].address,
          });
        }

        // retrying in case of connection error
        this.request({
          senderAddress: this.data.local.address,
          recipientAddress: this.data.incoming[incomingIndex].address,
          chatId: this.data.meta.chatId,
          retry: true,
        });
      });

      this.peerInstances[
        peerAddress ? peerAddress : this.data.incoming[0].address
      ]?.signal(signalData);

      // set videoCallInfo state with status connected for the caller's end
      this.setData((oldData) => {
        return produce(oldData, (draft) => {
          const incomingIndex = peerAddress
            ? getIncomingIndexFromAddress(oldData.incoming, peerAddress)
            : 0;
          draft.incoming[incomingIndex].status = VideoCallStatus.CONNECTED;
        });
      });
    } catch (err) {
      console.error('error in connect', err);
    }
  }

  disconnect(options?: VideoDisconnectOptions): void {
    const { peerAddress, details } = options || {};

    try {
      if (!options?.peerAddress) {
        console.warn('disconnect requires a peer address');
      }

      const incomingIndex = peerAddress
        ? getIncomingIndexFromAddress(this.data.incoming, peerAddress)
        : 0;

      if (
        this.data.incoming[incomingIndex].status === VideoCallStatus.CONNECTED
      ) {
        this.peerInstances[
          peerAddress ? peerAddress : this.data.incoming[0].address
        ]?.send(JSON.stringify({ type: 'endCall', value: true, details }));
        this.peerInstances[
          peerAddress ? peerAddress : this.data.incoming[0].address
        ]?.destroy();
      } else {
        // for disconnecting during status INITIALIZED, RECEIVED, RETRY_INITIALIZED, RETRY_RECEIVED
        // send a notif to the other user signaling status = DISCONNECTED
        sendVideoCallNotification(
          {
            signer: this.signer,
            chainId: this.chainId,
            pgpPrivateKey: this.pgpPrivateKey,
          },
          {
            senderAddress: this.data.local.address,
            recipientAddress: this.data.incoming[incomingIndex].address,
            status: VideoCallStatus.DISCONNECTED,
            chatId: this.data.meta.chatId,
            signalData: null,
            env: this.env,
            callType: this.callType,
            callDetails: details,
          }
        );
      }

      // destroy the peerInstance
      this.peerInstances[
        peerAddress ? peerAddress : this.data.incoming[0].address
      ]?.destroy();
      this.peerInstances[
        peerAddress ? peerAddress : this.data.incoming[0].address
      ] = null;

      // destroy the local stream
      if (this.data.local.stream) {
        endStream(this.data.local.stream);
      }

      // reset the state
      this.setData(() => initVideoCallData);
    } catch (err) {
      console.error('error in disconnect', err);
    }
  }

  // functions for enabling/disabling local audio and video

  enableVideo(options: EnableVideoInputOptions): void {
    const { state } = options || {};

    if (this.data.local.video !== state) {
      // need to change the video state

      // signal all the connected peers that the local peer has changed their video state
      for (const incomingPeer of this.data.incoming) {
        if (incomingPeer.status === VideoCallStatus.CONNECTED) {
          this.peerInstances[incomingPeer.address]?.send(
            JSON.stringify({
              type: 'isVideoOn',
              value: state,
            })
          );
        }
      }
      if (this.data.local.stream) {
        if (state) {
          restartVideoStream(this.data.local.stream);
        } else {
          stopVideoStream(this.data.local.stream);
        }
        this.setData((oldData) => {
          return produce(oldData, (draft) => {
            draft.local.video = state;
          });
        });
      }
    }
  }

  enableAudio(options: EnableAudioInputOptions): void {
    const { state } = options || {};

    if (this.data.local.audio !== state) {
      // need to change the audio state

      // Signal all the connected peers that the local peer has changed their audio state
      for (const incomingPeer of this.data.incoming) {
        if (
          incomingPeer.status === VideoCallStatus.CONNECTED &&
          this.peerInstances[incomingPeer.address]
        ) {
          try {
            this.peerInstances[incomingPeer.address].send(
              JSON.stringify({ type: 'isAudioOn', value: state })
            );
          } catch (error) {
            console.error('Error sending data:', error);
          }
        }
      }

      if (this.data.local.stream) {
        if (state) {
          restartAudioStream(this.data.local.stream);
        } else {
          stopAudioStream(this.data.local.stream);
        }
        this.setData((oldData) => {
          return produce(oldData, (draft) => {
            draft.local.audio = state;
          });
        });
      }
    }
  }

  // helper functions

  isInitiator(): boolean {
    if (
      this.data.meta.initiator.address === '' ||
      this.data.local.address === ''
    )
      return false;

    return this.data.meta.initiator.address === this.data.local.address;
  }
}
