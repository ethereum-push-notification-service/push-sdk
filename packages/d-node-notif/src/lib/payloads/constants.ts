export interface ChainIdToSourceType {
  [key: number]: string;
}

export const CHAIN_ID_TO_SOURCE: ChainIdToSourceType = {
  1: 'ETH_MAINNET',
  5: 'ETH_TEST_GOERLI',
  137: 'POLYGON_MAINNET',
  80002: 'POLYGON_TEST_AMOY',
  56: 'BSC_MAINNET',
  97: 'BSC_TESTNET',
  10: 'OPTIMISM_MAINNET',
  11155420: 'OPTIMISM_TESTNET',
  2442: 'POLYGON_ZK_EVM_TESTNET',
  1101: 'POLYGON_ZK_EVM_MAINNET',
  421614: 'ARBITRUM_TESTNET',
  42161: 'ARBITRUMONE_MAINNET',
  122: 'FUSE_MAINNET',
  123: 'FUSE_TESTNET',
  80085: 'BERACHAIN_TESTNET',
  7560: 'CYBER_CONNECT_MAINNET',
  111557560: 'CYBER_CONNECT_TESTNET',
};

export const SOURCE_TYPES = {
  ETH_MAINNET: 'ETH_MAINNET',
  ETH_TEST_GOERLI: 'ETH_TEST_GOERLI',
  POLYGON_MAINNET: 'POLYGON_MAINNET',
  POLYGON_TEST_AMOY: 'POLYGON_TEST_AMOY',
  BSC_MAINNET: 'BSC_MAINNET',
  BSC_TESTNET: 'BSC_TESTNET',
  OPTIMISM_MAINNET: 'OPTIMISM_MAINNET',
  OPTIMISM_TESTNET: 'OPTIMISM_TESTNET',
  POLYGON_ZK_EVM_TESTNET: 'POLYGON_ZK_EVM_TESTNET',
  POLYGON_ZK_EVM_MAINNET: 'POLYGON_ZK_EVM_MAINNET',
  ARBITRUM_TESTNET: 'ARBITRUM_TESTNET',
  ARBITRUMONE_MAINNET: 'ARBITRUMONE_MAINNET',
  FUSE_TESTNET: 'FUSE_TESTNET',
  FUSE_MAINNET: 'FUSE_MAINNET',
  BERACHAIN_TESTNET: 'BERACHAIN_TESTNET',
  THE_GRAPH: 'THE_GRAPH',
  PUSH_VIDEO: 'PUSH_VIDEO',
  SIMULATE: 'SIMULATE',
  CYBER_CONNECT_TESTNET: 'CYBER_CONNECT_TESTNET',
  CYBER_CONNECT_MAINNET: 'CYBER_CONNECT_MAINNET',
};

export const SUPPORTED_CHAINS = [
  1, 5, 42, 137, 80002, 56, 97, 10, 11155420, 2442, 1101, 421614, 42161, 122,
  123, 80085, 111557560, 7560,
];

export enum IDENTITY_TYPE {
  MINIMAL = 0,
  IPFS = 1,
  DIRECT_PAYLOAD = 2,
  SUBGRAPH = 3,
}

export enum NOTIFICATION_TYPE {
  BROADCAST = 1,
  TARGETTED = 3,
  SUBSET = 4,
}

export enum ADDITIONAL_META_TYPE {
  CUSTOM = 0,
  PUSH_VIDEO = 1,
  PUSH_SPACE = 2,
}

// Subset of ADDITIONAL_META_TYPE, to be used exclusively for Push Video, Spaces
export enum VIDEO_CALL_TYPE {
  PUSH_VIDEO = 1,
  PUSH_SPACE = 2,
}

export enum SPACE_REQUEST_TYPE {
  JOIN_SPEAKER, // space has started, join as a speaker
  ESTABLISH_MESH, // request to establish mesh connection
  INVITE_TO_PROMOTE, // host invites someone to be promoted as the speaker
  REQUEST_TO_PROMOTE, // someone requests the host to be promoted to a spaeker
}

export enum SPACE_ACCEPT_REQUEST_TYPE {
  ACCEPT_JOIN_SPEAKER,
  ACCEPT_INVITE,
  ACCEPT_PROMOTION,
}

export enum SPACE_DISCONNECT_TYPE {
  STOP, // space is stopped/ended
  LEAVE, // speaker leaves a space
}

export enum SPACE_INVITE_ROLES {
  CO_HOST,
  SPEAKER,
}

export enum SPACE_ROLES {
  HOST,
  CO_HOST,
  SPEAKER,
  LISTENER,
}

export const DEFAULT_DOMAIN = 'push.org';

export enum VIDEO_NOTIFICATION_ACCESS_TYPE {
  PUSH_CHAT = 'PUSH_CHAT',
}
