import Tooltip from '../../tooltip';

import { EthereumSvg } from '../../../icons/EthereumSvg';
import { PolygonSvg } from '../../../icons/PolygonSvg';
import { BSCSvg } from '../../../icons/BSCSvg';
import { OptimismSvg } from '../../../icons/OptimismSvg';
import { PolygonzkevmSvg } from '../../../icons/PolygonzkevmSvg';
import { ArbitrumSvg } from '../../../icons/ArbitrumSvg';
import { FuseSvg } from '../../../icons/FuseSvg';
import { BerachainSVG } from '../../../icons/BerachainSVG';
import { LineaSVG } from '../../../icons/LineaSVG';
import { BaseSVG } from '../../../icons/baseSVG';

import { CyberConnectSVG } from '../../../icons/CyberConnectSVG';
const createSVGIcon = (element: any, chainName: string) => {
  return <Tooltip tooltipContent={`${chainName}`}>{element}</Tooltip>;
};

export const NETWORK_ICON_DETAILS = {
  11155111: {
    label: 'ETHEREUM SEPOLIA',
    icon: createSVGIcon(<EthereumSvg />, 'Ethereum Sepolia'),
  },
  1: {
    label: 'ETHEREUM MAINNET',
    icon: createSVGIcon(<EthereumSvg />, 'Ethereum Mainnet'),
  },
  80002: {
    label: 'POLYGON AMOY',
    icon: createSVGIcon(<PolygonSvg />, 'Polygon Amoy'),
  },
  137: {
    label: 'POLYGON MAINNET',
    icon: createSVGIcon(<PolygonSvg />, 'Polygon Mainnet'),
  },
  97: {
    label: 'BSC TESTNET',
    icon: createSVGIcon(<BSCSvg />, 'Bsc Testnet'),
  },
  56: {
    label: 'BSC MAINNET',
    icon: createSVGIcon(<BSCSvg />, 'Bsc Mainnet'),
  },
  11155420: {
    label: 'OPTIMISM TESTNET',
    icon: createSVGIcon(<OptimismSvg />, 'Optimism Testnet'),
  },
  10: {
    label: 'OPTIMISM MAINNET',
    icon: createSVGIcon(<OptimismSvg />, 'Optimism Mainnet'),
  },
  1442: {
    label: 'POLYGON ZK EVM TESTNET',
    icon: createSVGIcon(<PolygonzkevmSvg />, 'Polygon ZK EVM Testnet'),
  },
  1101: {
    label: 'POLYGON ZK EVM MAINNET',
    icon: createSVGIcon(<PolygonzkevmSvg />, 'Polygon ZK EVM Mainnet'),
  },

  42161: {
    label: 'ARBITRUMONE MAINNET',
    icon: createSVGIcon(<ArbitrumSvg />, 'Arbitrum Mainnet'),
  },
  421614: {
    label: 'ARBITRUM TESTNET',
    icon: createSVGIcon(<ArbitrumSvg />, 'Arbitrum Testnet'),
  },
  123: {
    label: 'FUSE TESTNET',
    icon: createSVGIcon(<FuseSvg />, 'Fuse Testnet'),
  },
  122: {
    label: 'FUSE MAINNET',
    icon: createSVGIcon(<FuseSvg />, 'Fuse Mainnet'),
  },
  80085: {
    label: 'BERACHAIN TESTNET',
    icon: createSVGIcon(<BerachainSVG />, 'Berachain Testnet'),
  },
  59141: {
    label: 'LINEA TESTNET',
    icon: createSVGIcon(<LineaSVG />, 'Linea Testnet'),
  },
  59144: {
    label: 'LIENA MAINNET',
    icon: createSVGIcon(<LineaSVG />, 'Linea Mainnet'),
  },
  111557560: {
    label: 'CYBER CONNECT TESTNET',
    icon: createSVGIcon(<CyberConnectSVG />, 'CyberConnect Testnet'),
  },
  7560: {
    label: 'CYBER CONNECT MAINNET',
    icon: createSVGIcon(<CyberConnectSVG />, 'CyberConnect Mainnet'),
  },
  84532: {
    label: 'BASE TESTNET',
    icon: createSVGIcon(<BaseSVG />, 'Base Testnet'),
  },
  8453: {
    label: 'BASE MAINNET',
    icon: createSVGIcon(<BaseSVG />, 'Base Testnet'),
  },
};
