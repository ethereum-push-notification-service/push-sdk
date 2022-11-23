// the type for the the response of the input data to be parsed
export type ApiNotificationType = {
  payload_id: number;
  channel: string;
  epoch: string;
  payload: {
    apns: {
      payload: {
        aps: {
          category: string;
          'mutable-content': number;
          'content-available': number;
        };
      };
      fcm_options: {
        image: string;
      };
    };
    data: {
      app: string;
      sid: string;
      url: string;
      acta: string;
      aimg: string;
      amsg: string;
      asub: string;
      icon: string;
      type: string;
      epoch: string;
      appbot: string;
      hidden: string;
      secret: string;
    };
    android: {
      notification: {
        icon: string;
        color: string;
        image: string;
        default_vibrate_timings: boolean;
      };
    };
    notification: {
      body: string;
      title: string;
    };
  };
  source: string;
};

// The output response from parsing a notification object
export type ParsedResponseType = {
  cta: string;
  title: string;
  message: string;
  icon: string;
  url: string;
  sid: string;
  app: string;
  image: string;
  blockchain: string;
  secret: string;
  notification: {
    title: string;
    body: string;
  };
};

export interface ISendNotificationInputOptions {
  signer: any;
  type: number;
  identityType: number;
  notification?: {
    title: string;
    body: string;
  };
  payload?: {
    sectype?: string;
    title: string;
    body: string;
    cta: string;
    img: string;
    metadata?: any;
  };
  recipients?: string | string[]; // CAIP or plain ETH
  channel: string; // CAIP or plain ETH
  expiry?: number;
  hidden?: boolean;
  graph?: {
    id: string;
    counter: number;
  };
  ipfsHash?: string;
  env?: string;
}

export interface INotificationPayload {
  notification: {
    title: string;
    body: string;
  };
  data: {
    acta: string;
    aimg: string;
    amsg: string;
    asub: string;
    type: string;
    etime?: number;
    hidden?: boolean;
    sectype?: string;
  };
  recipients: any;
}

export interface IInboxChat {
  name: string;
  profilePicture: string;
  timestamp: number;
  fromDID: string;
  toDID: string;
  fromCAIP10: string;
  toCAIP10: string;
  lastMessage: string;
  messageType: string;
  encType: string;
  signature: string;
  signatureType: string;
  encryptedSecret: string;
}

export interface IFeeds {
  msg: IInboxChat;
  did: string;
  wallets: string;
  profilePicture: string | null;
  publicKey: string;
  about: string | null;
  threadhash: string | null;
  intent: string | null;
  intentSentBy: string | null;
  intentTimestamp: Date;
  combinedDID: string;
  cid: string;
}

export interface IUser {
  did: string;
  wallets: string;
  profilePicture: string | null;
  publicKey: string;
  encryptedPrivateKey: string;
  encryptionType: string;
  signature: string;
  sigType: string;
  about: string | null;
  name: string | null;
  numMsg: number;
  allowedNumMsg: number;
  linkedListHash?: string | null;
}

export interface IConnectedUser extends IUser {
  privateKey: string | null;
}

export interface IMessageIPFS {
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
  encryptedSecret: string;
}

export interface IMessageIPFSWithCID extends IMessageIPFS {
  cid: string;
}

export interface AccountEnvOptionsType {
  env?: string;
  account: string;
}

export interface ChatOptionsType extends AccountEnvOptionsType {
  messageContent?: string;
  messageType?: 'Text' | 'Image' | 'File';
  receiverAddress: string;
  pgpPrivateKey?: string;
  connectedUser: IConnectedUser;
};

export interface ConversationHashOptionsType extends AccountEnvOptionsType {
  conversationId: string;
};

export interface Chat {
  did: string;
  wallets: string;
  profilePicture: string | null;
  publicKey: string | null;
  about: string | null;
  name: string | null;
  threadhash: string | null;
  intent: string | null;
  intentSentBy: string | null;
  intentTimestamp: Date;
  combinedDID: string;
}