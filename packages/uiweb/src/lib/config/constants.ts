import { PushSubTabs } from '../types';

export enum ENV {
  PROD = 'prod',
  STAGING = 'staging',
  DEV = 'dev',
  /**
   * **This is for local development only**
   */
  LOCAL = 'local',
}
export const Constants = {
  ENV,
  DEFAULT_TITLE: 'Chat with us!',
  DEFAULT_GREETING_MSG: 'Hi there!',
  DEFAULT_PROFILE_PICTURE:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAvklEQVR4AcXBsW2FMBiF0Y8r3GQb6jeBxRauYRpo4yGQkMd4A7kg7Z/GUfSKe8703fKDkTATZsJsrr0RlZSJ9r4RLayMvLmJjnQS1d6IhJkwE2bT13U/DBzp5BN73xgRZsJMmM1HOolqb/yWiWpvjJSUiRZWopIykTATZsJs5g+1N6KSMiO1N/5DmAkzYTa9Lh6MhJkwE2ZzSZlo7xvRwson3txERzqJhJkwE2bT6+JhoKTMJ2pvjAgzYSbMfgDlXixqjH6gRgAAAABJRU5ErkJggg==',
};

export const ALCHEMY_API_KEY = 'rtkd-a4JWpnViQBZdNCiFBGTJdp5e0R2';
export const NETWORK_DETAILS = {
  11155111: {
    network: 'sepolia',
  },
  80001: {
    network: 'polygon-mumbai',
  },
  1: {
    network: 'mainnet',
  },
  137: {
    network: 'polygon-mainnet',
  },
  97: {},
  420: {},
};

//todo: need to change o sepolia
export const CoreContractChainId = {
  prod: 1,
  dev: 5,
  staging: 5,
  local: 5,
};



const TESTNET_NETWORK = {
  ETHEREUM: 'eip155:11155111',
  POLYGON: 'eip155:80001',
  BSC: 'eip155:97',
  OPTIMISM: 'eip155:420',
  POLYGON_ZK_EVM: 'eip155:1442',
  ARBITRUM:'eip155:421613'
};
const MAINET_NETWORK = {
  ETHEREUM: 'eip155:1',
  POLYGON: 'eip155:137',
  BSC: 'eip155:56',
  OPTIMISM: 'eip155:10',
  POLYGON_ZK_EVM: 'eip155:1101',
  ARBITRUM:'eip155:42161'
};

export const BLOCKCHAIN_NETWORK = {
  prod: MAINET_NETWORK,
  dev: TESTNET_NETWORK,
  staging: TESTNET_NETWORK,
  local: TESTNET_NETWORK,
};

export const allowedNetworks = {
  prod: [
    1, //for ethereum mainnet
    137, //for polygon mainnet
    56, // for bnb mainnet
    10, // for optimism mainnet
    42161 // for arbitrum mainnet
  ],
  dev: [
    11155111, // for eth sepolia
    80001, //for mumbai polygon
    97, // bnb testnet
    420, // optimism goerli testnet
    421613 // for arbitrum testnet
  ],
  staging: [
    // 42, //for kovan
    11155111, // for sepolia
    80001, //for mumbai polygon
    97, // bnb testnet
    420, // optimism goerli testnet
    421613 // for arbitrum testnet
  ],
  local: [
    11155111, // for eth sepolia
    80001, //for mumbai polygon
    97, // bnb testnet
    420, // optimism goerli testnet
    421613 // for arbitrum testnet
  ]
}

export const BLOCKNATIVE_PROJECT_ID = '64a44a0fb537407bfe97d24330e4109c';

export const InfuraAPIKey = '150f25623ae64d08ab7ec7dd0c6b6ee9';

export const PUBLIC_GOOGLE_TOKEN = 'AIzaSyBhUBnCia6zpxY7KcqjghRS1IphinAvKXs';

export const ProfilePicture = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAvklEQVR4AcXBsW2FMBiF0Y8r3GQb6jeBxRauYRpo4yGQkMd4A7kg7Z/GUfSKe8703fKDkTATZsJsrr0RlZSJ9r4RLayMvLmJjnQS1d6IhJkwE2bT13U/DBzp5BN73xgRZsJMmM1HOolqb/yWiWpvjJSUiRZWopIykTATZsJs5g+1N6KSMiO1N/5DmAkzYTa9Lh6MhJkwE2ZzSZlo7xvRwson3txERzqJhJkwE2bT6+JhoKTMJ2pvjAgzYSbMfgDlXixqjH6gRgAAAABJRU5ErkJggg==`;

export const PushSubTabTitle = {
  REQUESTS: {
    title: 'Chat request',
  },
  SPAM: {
    title: 'Spam',
  },
};

export const chatLimit = 10;
export const requestLimit = 10;
export const notificationLimit = 5;

export const FILE_ICON = (extension: string) =>
  `https://cdn.jsdelivr.net/gh/napthedev/file-icons/file/${extension}.svg`;

// Livekit Server URLs
export const LIVEKIT_SERVER_URL = "https://spacev2-demo-17wvllxz.livekit.cloud";
export const LIVEKIT_SERVER_WEBSOCKET_URL = "wss://spacev2-demo-17wvllxz.livekit.cloud";
export const LIVEKIT_TOKEN_GENERATOR_SERVER_URL = "https://ms-lk-server.onrender.com";

export const GUEST_MODE_ACCOUNT = '0x0000000000000000000000000000000000000000';
