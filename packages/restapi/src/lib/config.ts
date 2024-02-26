import Constants from './constants';
import { coreABI } from './abis/core';
import { commABI } from './abis/comm';
import { tokenABI } from './abis/token';
import {
  mainnet,
  polygon,
  polygonMumbai,
  bsc,
  bscTestnet,
  optimism,
  optimismGoerli,
  polygonZkEvm,
  polygonZkEvmTestnet,
  sepolia,
  arbitrum,
  arbitrumGoerli,
  fuse,
  fuseSparknet,
} from 'viem/chains';
import { defineChain } from 'viem';
const { ENV } = Constants;

export const berachainTestnet = defineChain({
  id: 80085,
  name: 'Berachain Artio',
  network: 'berachain-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BERA Token',
    symbol: 'BERA',
  },
  rpcUrls: {
    default: { http: ['https://artio.rpc.berachain.com'] },
    public: { http: ['https://artio.rpc.berachain.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Berachain',
      url: 'https://artio.beratrail.io',
    },
  },
  testnet: true,
});

// for methods not needing the entire config
export const API_BASE_URL = {
  [ENV.PROD]: 'https://backend.epns.io/apis',
  [ENV.STAGING]: 'https://backend-staging.epns.io/apis',
  [ENV.DEV]: 'https://backend-dev.epns.io/apis',

  /**
   * **This is for local development only**
   */
  [ENV.LOCAL]: 'http://localhost:4000/apis',
};

const BLOCKCHAIN_NETWORK = {
  ETH_MAINNET: 'eip155:1',
  ETH_SEPOLIA: 'eip155:11155111',
  POLYGON_MAINNET: 'eip155:137',
  POLYGON_MUMBAI: 'eip155:80001',
  BSC_MAINNET: 'eip155:56',
  BSC_TESTNET: 'eip155:97',
  OPTIMISM_TESTNET: 'eip155:420',
  OPTIMISM_MAINNET: 'eip155:10',
  POLYGON_ZK_EVM_TESTNET: 'eip155:1442',
  POLYGON_ZK_EVM_MAINNET: 'eip155:1101',
  ARBITRUM_TESTNET: 'eip155:421613',
  ARBITRUMONE_MAINNET: 'eip155:42161',
  FUSE_TESTNET: 'eip155:123',
  FUSE_MAINNET: 'eip155:122',
  BERACHAIN_TESTNET: 'eip155:80085',
};

export type ALIAS_CHAIN =
  | 'POLYGON'
  | 'BSC'
  | 'OPTIMISM'
  | 'POLYGONZKEVM'
  | 'ARBITRUMONE'
  | 'FUSE'
  | 'BERACHAIN';

export const ETH_CHAIN_ID = {
  [ENV.PROD]: 1,
  [ENV.STAGING]: 11155111,
  [ENV.DEV]: 11155111,
  [ENV.LOCAL]: 11155111,
};
export const ALIAS_CHAIN_ID = {
  POLYGON: {
    [ENV.PROD]: 137,
    [ENV.STAGING]: 80001,
    [ENV.DEV]: 80001,
    [ENV.LOCAL]: 80001,
  },
  BSC: {
    [ENV.PROD]: 56,
    [ENV.STAGING]: 97,
    [ENV.DEV]: 97,
    [ENV.LOCAL]: 97,
  },
  OPTIMISM: {
    [ENV.PROD]: 10,
    [ENV.STAGING]: 420,
    [ENV.DEV]: 420,
    [ENV.LOCAL]: 420,
  },
  POLYGONZKEVM: {
    [ENV.PROD]: 1101,
    [ENV.STAGING]: 1442,
    [ENV.DEV]: 1442,
    [ENV.LOCAL]: 1442,
  },
  ARBITRUMONE: {
    [ENV.PROD]: 42161,
    [ENV.STAGING]: 421613,
    [ENV.DEV]: 421613,
    [ENV.LOCAL]: 421613,
  },
  FUSE: {
    [ENV.PROD]: 122,
    [ENV.STAGING]: 123,
    [ENV.DEV]: 123,
    [ENV.LOCAL]: 123,
  },
  BERACHAIN: {
    [ENV.STAGING]: 80085,
    [ENV.DEV]: 80085,
    [ENV.LOCAL]: 80085,
  }
};

export const CHAIN_ID = {
  ETHEREUM: ETH_CHAIN_ID,
  ...ALIAS_CHAIN_ID,
};

export const CHAIN_NAME: { [key: number]: string } = {
  // eth
  1: 'ETHEREUM',
  11155111: 'ETHEREUM',
  // polygon
  137: 'POLYGON',
  80001: 'POLYGON',
  // bsc
  56: 'BSC',
  97: 'BSC',
  // optimism
  10: 'OPTIMISM',
  420: 'OPTIMISM',
  // plygonzkevm
  1101: 'POLYGONZKEVM',
  1442: 'POLYGONZKEVM',
  // arbitrun
  421613: 'ARBITRUN',
  42161: 'ARBITRUM',
  // fuse
  122: 'FUSE',
  123: 'FUSE',
  // berachain
  80085: 'BERACHAIN'
};
export interface ConfigType {
  API_BASE_URL: string;
  EPNS_COMMUNICATOR_CONTRACT: string;
}

export const VIEM_CORE_CONFIG = {
  [ENV.PROD]: {
    NETWORK: mainnet,
    API_BASE_URL: API_BASE_URL[ENV.PROD],
    EPNS_CORE_CONTRACT: '0x66329Fdd4042928BfCAB60b179e1538D56eeeeeE',
  },
  [ENV.STAGING]: {
    NETWORK: sepolia,
    API_BASE_URL: API_BASE_URL[ENV.STAGING],
    EPNS_CORE_CONTRACT: '0x9d65129223451fbd58fc299c635cd919baf2564c',
  },
  [ENV.DEV]: {
    NETWORK: sepolia,
    API_BASE_URL: API_BASE_URL[ENV.DEV],
    EPNS_CORE_CONTRACT: '0x5ab1520e2bd519bdab2e1347eee81c00a77f4946',
  },
  [ENV.LOCAL]: {
    NETWORK: sepolia,
    API_BASE_URL: API_BASE_URL[ENV.DEV],
    EPNS_CORE_CONTRACT: '0x5ab1520e2bd519bdab2e1347eee81c00a77f4946',
  },
};

export const CORE_CONFIG = {
  [ENV.PROD]: {
    API_BASE_URL: API_BASE_URL[ENV.PROD],
    EPNS_CORE_CONTRACT: '0x66329Fdd4042928BfCAB60b179e1538D56eeeeeE',
  },
  [ENV.STAGING]: {
    API_BASE_URL: API_BASE_URL[ENV.STAGING],
    EPNS_CORE_CONTRACT: '0x9d65129223451fbd58fc299c635cd919baf2564c',
  },
  [ENV.DEV]: {
    API_BASE_URL: API_BASE_URL[ENV.DEV],
    EPNS_CORE_CONTRACT: '0x5ab1520e2bd519bdab2e1347eee81c00a77f4946',
  },
  [ENV.LOCAL]: {
    API_BASE_URL: API_BASE_URL[ENV.DEV],
    EPNS_CORE_CONTRACT: '0x5ab1520e2bd519bdab2e1347eee81c00a77f4946',
  },
};

const CONFIG = {
  [ENV.PROD]: {
    [BLOCKCHAIN_NETWORK.ETH_MAINNET]: {
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.POLYGON_MAINNET]: {
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.BSC_MAINNET]: {
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.OPTIMISM_MAINNET]: {
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.POLYGON_ZK_EVM_MAINNET]: {
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.ARBITRUMONE_MAINNET]: {
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.FUSE_MAINNET]: {
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    }
  },
  [ENV.STAGING]: {
    [BLOCKCHAIN_NETWORK.ETH_SEPOLIA]: {
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0x0c34d54a09cfe75bccd878a469206ae77e0fe6e7',
    },
    [BLOCKCHAIN_NETWORK.POLYGON_MUMBAI]: {
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.BSC_TESTNET]: {
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.OPTIMISM_TESTNET]: {
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.POLYGON_ZK_EVM_TESTNET]: {
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.ARBITRUM_TESTNET]: {
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.FUSE_TESTNET]: {
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.BERACHAIN_TESTNET]: {
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xA1DF3E68D085aa6918bcc2506b24e499830Db0eB',
    },
  },
  [ENV.DEV]: {
    [BLOCKCHAIN_NETWORK.ETH_SEPOLIA]: {
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0x9dDCD7ed7151afab43044E4D694FA064742C428c',
    },
    [BLOCKCHAIN_NETWORK.POLYGON_MUMBAI]: {
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0xAf55BE8e6b0d6107891bA76eADeEa032ef8A4504',
    },
    [BLOCKCHAIN_NETWORK.BSC_TESTNET]: {
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0x4132061E3349ff36cFfCadA460E10Bd4f31F7ea8',
    },
    [BLOCKCHAIN_NETWORK.OPTIMISM_TESTNET]: {
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0x4305D572F2bf38Fc2AE8D0172055b1EFd18F57a6',
    },
    [BLOCKCHAIN_NETWORK.POLYGON_ZK_EVM_TESTNET]: {
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0x630b152e4185c63D7177c656b56b26f878C61572',
    },
    [BLOCKCHAIN_NETWORK.ARBITRUM_TESTNET]: {
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0x2f6aE0907116A2c50D712e78b48D874fadeB6850',
    },
    [BLOCKCHAIN_NETWORK.FUSE_TESTNET]: {
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0x7eBb54D86CF928115965DB596a3E600404dD8039',
    },
    [BLOCKCHAIN_NETWORK.BERACHAIN_TESTNET]: {
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0xA1DF3E68D085aa6918bcc2506b24e499830Db0eB',
    },
  },
  [ENV.LOCAL]: {
    [BLOCKCHAIN_NETWORK.ETH_SEPOLIA]: {
      API_BASE_URL: API_BASE_URL[ENV.LOCAL],
      EPNS_COMMUNICATOR_CONTRACT: '0x9dDCD7ed7151afab43044E4D694FA064742C428c',
    },
    [BLOCKCHAIN_NETWORK.POLYGON_MUMBAI]: {
      API_BASE_URL: API_BASE_URL[ENV.LOCAL],
      EPNS_COMMUNICATOR_CONTRACT: '0xAf55BE8e6b0d6107891bA76eADeEa032ef8A4504',
    },
    [BLOCKCHAIN_NETWORK.BSC_TESTNET]: {
      API_BASE_URL: API_BASE_URL[ENV.LOCAL],
      EPNS_COMMUNICATOR_CONTRACT: '0x4132061E3349ff36cFfCadA460E10Bd4f31F7ea8',
    },
    [BLOCKCHAIN_NETWORK.OPTIMISM_TESTNET]: {
      API_BASE_URL: API_BASE_URL[ENV.LOCAL],
      EPNS_COMMUNICATOR_CONTRACT: '0x4305D572F2bf38Fc2AE8D0172055b1EFd18F57a6',
    },
    [BLOCKCHAIN_NETWORK.POLYGON_ZK_EVM_TESTNET]: {
      API_BASE_URL: API_BASE_URL[ENV.LOCAL],
      EPNS_COMMUNICATOR_CONTRACT: '0x630b152e4185c63D7177c656b56b26f878C61572',
    },
    [BLOCKCHAIN_NETWORK.ARBITRUM_TESTNET]: {
      API_BASE_URL: API_BASE_URL[ENV.LOCAL],
      EPNS_COMMUNICATOR_CONTRACT: '0x2f6aE0907116A2c50D712e78b48D874fadeB6850',
    },
    [BLOCKCHAIN_NETWORK.FUSE_TESTNET]: {
      API_BASE_URL: API_BASE_URL[ENV.LOCAL],
      EPNS_COMMUNICATOR_CONTRACT: '0x7eBb54D86CF928115965DB596a3E600404dD8039',
    },
    [BLOCKCHAIN_NETWORK.BERACHAIN_TESTNET]: {
      API_BASE_URL: API_BASE_URL[ENV.LOCAL],
      EPNS_COMMUNICATOR_CONTRACT: '0xA1DF3E68D085aa6918bcc2506b24e499830Db0eB',
    },
  },
};

export default CONFIG;
export const TOKEN = {
  [ENV.PROD]: '0xf418588522d5dd018b425E472991E52EBBeEEEEE',
  [ENV.STAGING]: '0x37c779a1564DCc0e3914aB130e0e787d93e21804',
  [ENV.DEV]: '0x37c779a1564DCc0e3914aB130e0e787d93e21804',
  [ENV.LOCAL]: '0x37c779a1564DCc0e3914aB130e0e787d93e21804',
};

export const TOKEN_VIEM_NETWORK_MAP = {
  [ENV.PROD]: mainnet,
  [ENV.STAGING]: sepolia,
  [ENV.DEV]: sepolia,
  [ENV.LOCAL]: sepolia,
};

export const MIN_TOKEN_BALANCE = {
  [ENV.PROD]: 50,
  [ENV.STAGING]: 50,
  [ENV.DEV]: 50,
  [ENV.LOCAL]: 50,
};
export const ABIS = {
  CORE: coreABI,
  COMM: commABI,
  TOKEN: tokenABI,
};

export const CHANNEL_TYPE = {
  TIMEBOUND: 4,
  GENERAL: 2,
};

export const VIEM_CONFIG = {
  [ENV.PROD]: {
    [BLOCKCHAIN_NETWORK.ETH_MAINNET]: {
      NETWORK: mainnet,
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.POLYGON_MAINNET]: {
      NETWORK: polygon,
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.BSC_MAINNET]: {
      NETWORK: bsc,
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.OPTIMISM_MAINNET]: {
      NETWORK: optimism,
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.POLYGON_ZK_EVM_MAINNET]: {
      NETWORK: polygonZkEvm,
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.ARBITRUMONE_MAINNET]: {
      NETWORK: arbitrum,
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.FUSE_MAINNET]: {
      NETWORK: fuse,
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
  },
  [ENV.STAGING]: {
    [BLOCKCHAIN_NETWORK.ETH_SEPOLIA]: {
      NETWORK: sepolia,
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0x0c34d54a09cfe75bccd878a469206ae77e0fe6e7',
    },
    [BLOCKCHAIN_NETWORK.POLYGON_MUMBAI]: {
      NETWORK: polygonMumbai,
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.BSC_TESTNET]: {
      NETWORK: bscTestnet,
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.OPTIMISM_TESTNET]: {
      NETWORK: optimismGoerli,
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.POLYGON_ZK_EVM_TESTNET]: {
      NETWORK: polygonZkEvmTestnet,
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.ARBITRUM_TESTNET]: {
      NETWORK: arbitrumGoerli,
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.FUSE_TESTNET]: {
      NETWORK: fuseSparknet,
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
    },
    [BLOCKCHAIN_NETWORK.BERACHAIN_TESTNET]: {
      NETWORK: berachainTestnet,
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xA1DF3E68D085aa6918bcc2506b24e499830Db0eB',
    },
  },
  [ENV.DEV]: {
    [BLOCKCHAIN_NETWORK.ETH_SEPOLIA]: {
      NETWORK: sepolia,
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0x9dDCD7ed7151afab43044E4D694FA064742C428c',
    },
    [BLOCKCHAIN_NETWORK.POLYGON_MUMBAI]: {
      NETWORK: polygonMumbai,
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0xAf55BE8e6b0d6107891bA76eADeEa032ef8A4504',
    },
    [BLOCKCHAIN_NETWORK.BSC_TESTNET]: {
      NETWORK: bscTestnet,
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0x4132061E3349ff36cFfCadA460E10Bd4f31F7ea8',
    },
    [BLOCKCHAIN_NETWORK.OPTIMISM_TESTNET]: {
      NETWORK: optimismGoerli,
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0x4305D572F2bf38Fc2AE8D0172055b1EFd18F57a6',
    },
    [BLOCKCHAIN_NETWORK.POLYGON_ZK_EVM_TESTNET]: {
      NETWORK: polygonZkEvmTestnet,
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0x630b152e4185c63D7177c656b56b26f878C61572',
    },
    [BLOCKCHAIN_NETWORK.ARBITRUM_TESTNET]: {
      NETWORK: arbitrumGoerli,
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0x2f6aE0907116A2c50D712e78b48D874fadeB6850',
    },
    [BLOCKCHAIN_NETWORK.FUSE_TESTNET]: {
      NETWORK: fuseSparknet,
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0x7eBb54D86CF928115965DB596a3E600404dD8039',
    },
    [BLOCKCHAIN_NETWORK.BERACHAIN_TESTNET]: {
      NETWORK: berachainTestnet,
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0xA1DF3E68D085aa6918bcc2506b24e499830Db0eB',
    },
  },
  [ENV.LOCAL]: {
    [BLOCKCHAIN_NETWORK.ETH_SEPOLIA]: {
      NETWORK: sepolia,
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0x9dDCD7ed7151afab43044E4D694FA064742C428c',
    },
    [BLOCKCHAIN_NETWORK.POLYGON_MUMBAI]: {
      NETWORK: polygonMumbai,
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0xAf55BE8e6b0d6107891bA76eADeEa032ef8A4504',
    },
    [BLOCKCHAIN_NETWORK.BSC_TESTNET]: {
      NETWORK: bscTestnet,
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0x4132061E3349ff36cFfCadA460E10Bd4f31F7ea8',
    },
    [BLOCKCHAIN_NETWORK.OPTIMISM_TESTNET]: {
      NETWORK: optimismGoerli,
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0x4305D572F2bf38Fc2AE8D0172055b1EFd18F57a6',
    },
    [BLOCKCHAIN_NETWORK.POLYGON_ZK_EVM_TESTNET]: {
      NETWORK: polygonZkEvmTestnet,
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0x630b152e4185c63D7177c656b56b26f878C61572',
    },
    [BLOCKCHAIN_NETWORK.ARBITRUM_TESTNET]: {
      NETWORK: arbitrumGoerli,
      API_BASE_URL: API_BASE_URL[ENV.LOCAL],
      EPNS_COMMUNICATOR_CONTRACT: '0x2f6aE0907116A2c50D712e78b48D874fadeB6850',
    },
    [BLOCKCHAIN_NETWORK.FUSE_TESTNET]: {
      NETWORK: fuseSparknet,
      API_BASE_URL: API_BASE_URL[ENV.LOCAL],
      EPNS_COMMUNICATOR_CONTRACT: '0x7eBb54D86CF928115965DB596a3E600404dD8039',
    },
    [BLOCKCHAIN_NETWORK.BERACHAIN_TESTNET]: {
      NETWORK: berachainTestnet,
      API_BASE_URL: API_BASE_URL[ENV.LOCAL],
      EPNS_COMMUNICATOR_CONTRACT: '0xA1DF3E68D085aa6918bcc2506b24e499830Db0eB',
    },
  },
};

export const ALPHA_FEATURE_CONFIG = {
  STABLE: {
    feature: [] as string[],
  },
  ALPHA: {
    feature: [Constants.ALPHA_FEATURES.SCALABILITY_V2],
  },
};
