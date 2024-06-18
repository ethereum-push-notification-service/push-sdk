// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../../package.json');

import {
  ChannelListOrderType,
  ChannelListSortType,
  ChannelListType,
} from './pushNotification/PushNotificationTypes';
import { STREAM } from './pushstream/pushStreamTypes';
import { NotifictaionType } from './types';

/**
 * SUPPORTED ENVIRONEMENTS
 */
export enum ENV {
  PROD = 'prod',
  STAGING = 'staging',
  DEV = 'dev',
  /**
   * **This is for local development only**
   */
  LOCAL = 'local',
}

/**
 * SUPPORTED ENCRYPTIONS FOR PUSH PROFILE
 */
export enum ENCRYPTION_TYPE {
  PGP_V1 = 'x25519-xsalsa20-poly1305',
  PGP_V2 = 'aes256GcmHkdfSha256',
  PGP_V3 = 'eip191-aes256-gcm-hkdf-sha256',
  NFTPGP_V1 = 'pgpv1:nft',
}

export const ALPHA_FEATURES = {};

export const PACKAGE_BUILD = packageJson.version.includes('alpha')
  ? 'ALPHA'
  : 'STABLE';

const CONSTANTS = {
  ENV: ENV,
  STREAM: STREAM,
  ALPHA_FEATURES: ALPHA_FEATURES,
  USER: { ENCRYPTION_TYPE: ENCRYPTION_TYPE },
  NOTIFICATION: {
    TYPE: NotifictaionType,
    CHANNEL: {
      LIST_TYPE: ChannelListType,
    },
  },
  FILTER: {
    CHANNEL_LIST: {
      SORT: ChannelListSortType,
      ORDER: ChannelListOrderType,
    },
    NOTIFICATION_TYPE: NotifictaionType,
  },
  PAGINATION: {
    INITIAL_PAGE: 1,
    LIMIT: 10,
    LIMIT_MIN: 1,
    LIMIT_MAX: 50,
  },
  ENC_TYPE_V1: 'x25519-xsalsa20-poly1305',
  ENC_TYPE_V2: 'aes256GcmHkdfSha256',
  ENC_TYPE_V3: 'eip191-aes256-gcm-hkdf-sha256',
  ENC_TYPE_V4: 'pgpv1:nft',
};

export default CONSTANTS;
