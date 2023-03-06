import Constants from './constants';

const { ENV } = Constants;

// for methods not needing the entire config
export const API_BASE_URL = {
  [ENV.PROD]: 'https://backend.epns.io/apis',
  [ENV.STAGING]: 'https://backend-staging.epns.io/apis',
  [ENV.DEV]: 'https://backend-dev.epns.io/apis'
};

const BLOCKCHAIN_NETWORK = {
  ETH_MAINNET: 'eip155:1',
  ETH_GOERLI: 'eip155:5',
  POLYGON_MAINNET: 'eip155:137',
  POLYGON_MUMBAI: 'eip155:80001',
  BSC_MAINNET: 'eip155:56',
  BSC_TESTNET: 'eip155:97'
};

export type ALIAS_CHAIN = 'POLYGON' | 'BSC';

export const ALIAS_CHAIN_ID = {
  POLYGON: {
    [ENV.PROD]: 137,
    [ENV.STAGING]: 80001,
    [ENV.DEV]: 80001
  },
  BSC: {
    [ENV.PROD]: 56,
    [ENV.STAGING]: 97,
    [ENV.DEV]: 97
  }
}

export interface ConfigType {
  API_BASE_URL: string,
  EPNS_COMMUNICATOR_CONTRACT: string
}

const CONFIG = {
  [ENV.PROD]: {
    [BLOCKCHAIN_NETWORK.ETH_MAINNET]: {
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa'
    },
    [BLOCKCHAIN_NETWORK.POLYGON_MAINNET]: {
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa'
    },
    [BLOCKCHAIN_NETWORK.BSC_MAINNET]: {
      API_BASE_URL: API_BASE_URL[ENV.PROD],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa'
    }
  },
  [ENV.STAGING]: {
    [BLOCKCHAIN_NETWORK.ETH_GOERLI]: {
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa'
    },
    [BLOCKCHAIN_NETWORK.POLYGON_MUMBAI]: {
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa'
    },
    [BLOCKCHAIN_NETWORK.BSC_TESTNET]: {
      API_BASE_URL: API_BASE_URL[ENV.STAGING],
      EPNS_COMMUNICATOR_CONTRACT: '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa'
    }
  },
  [ENV.DEV]: {
    [BLOCKCHAIN_NETWORK.ETH_GOERLI]: {
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0xc064F30bac07e84500c97A04D21a9d1bfFC72Ec0'
    },
    [BLOCKCHAIN_NETWORK.POLYGON_MUMBAI]: {
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0xAf55BE8e6b0d6107891bA76eADeEa032ef8A4504'
    },
    [BLOCKCHAIN_NETWORK.BSC_TESTNET]: {
      API_BASE_URL: API_BASE_URL[ENV.DEV],
      EPNS_COMMUNICATOR_CONTRACT: '0x4132061E3349ff36cFfCadA460E10Bd4f31F7ea8'
    }
  }
};

export default CONFIG;