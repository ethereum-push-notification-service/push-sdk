import Constants from './constants';
import coreABI from './abis/core';
import commABI from './abis/comm';
import tokenABI from './abis/token';
const { ENV } = Constants;

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
  ETH_GOERLI: 'eip155:5',
  POLYGON_MAINNET: 'eip155:137',
  POLYGON_MUMBAI: 'eip155:80001',
  BSC_MAINNET: 'eip155:56',
  BSC_TESTNET: 'eip155:97',
  OPTIMISM_TESTNET: 'eip155:420',
  OPTIMISM_MAINNET: 'eip155:10',
  POLYGON_ZK_EVM_TESTNET: 'eip155:1442',
  POLYGON_ZK_EVM_MAINNET: 'eip155:1101',
};

export type ALIAS_CHAIN = 'POLYGON' | 'BSC' | 'OPTIMISM' | 'POLYGONZKEVM';

export const ETH_CHAIN_ID = {
  [ENV.PROD]: 1,
  [ENV.STAGING]: 5,
  [ENV.DEV]: 5,
  [ENV.LOCAL]: 5,
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
};

export const CHAIN_ID = {
  ETHEREUM: ETH_CHAIN_ID,
  ...ALIAS_CHAIN_ID,
};

export const CHAIN_NAME: { [key: number]: string } = {
  // eth
  1: 'ETHEREUM',
  5: 'ETHEREUM',
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
};
export interface ConfigType {
  API_BASE_URL: string;
  EPNS_COMMUNICATOR_CONTRACT: string;
}

export const CORE_CONFIG = {
  [ENV.PROD]: {
    API_BASE_URL: API_BASE_URL[ENV.PROD],
    EPNS_CORE_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
  },
  [ENV.STAGING]: {
    API_BASE_URL: API_BASE_URL[ENV.STAGING],
    EPNS_CORE_CONTRACT: '0xd4E3ceC407cD36d9e3767cD189ccCaFBF549202C',
  },
  [ENV.DEV]: {
    API_BASE_URL: API_BASE_URL[ENV.DEV],
    EPNS_CORE_CONTRACT: '0xc064F30bac07e84500c97A04D21a9d1bfFC72Ec0',
  },
  [ENV.LOCAL]: {
    API_BASE_URL: API_BASE_URL[ENV.DEV],
    EPNS_CORE_CONTRACT: '0xc064F30bac07e84500c97A04D21a9d1bfFC72Ec0',
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
  },
  [ENV.STAGING]: {
    [BLOCKCHAIN_NETWORK.ETH_GOERLI]: {
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
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
  },
  [ENV.DEV]: {
    [BLOCKCHAIN_NETWORK.ETH_GOERLI]: {
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0xc064F30bac07e84500c97A04D21a9d1bfFC72Ec0',
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
  },
  [ENV.LOCAL]: {
    [BLOCKCHAIN_NETWORK.ETH_GOERLI]: {
      API_BASE_URL: API_BASE_URL[ENV.LOCAL],
      EPNS_COMMUNICATOR_CONTRACT: '0xc064F30bac07e84500c97A04D21a9d1bfFC72Ec0',
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
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0x630b152e4185c63D7177c656b56b26f878C61572',
    },
  },
};

export default CONFIG;
export const TOKEN = {
  [ENV.PROD]: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa',
  [ENV.STAGING]: '0x2b9bE9259a4F5Ba6344c1b1c07911539642a2D33',
  [ENV.DEV]: '0x2b9bE9259a4F5Ba6344c1b1c07911539642a2D33',
  [ENV.LOCAL]: '0x2b9bE9259a4F5Ba6344c1b1c07911539642a2D33',
};

export const MIN_TOKEN_BALANCE = {
  [ENV.PROD]: 50,
  [ENV.STAGING]: 50,
  [ENV.DEV]: 50,
  [ENV.LOCAL]: 50,
}
export const ABIS = {
  CORE: coreABI,
  COMM: commABI,
  TOKEN: tokenABI,
};

export const CHANNEL_TYPE = {
  TIMEBOUND: 4,
  GENERAL: 2
}
