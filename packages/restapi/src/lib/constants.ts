// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../../package.json');

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
  SCWPGP_V1 = 'pgpv1:scw',
}

/**
 * SUPPORTED MESSAGE TYPES FOR PUSH CHAT
 */
export enum MessageType {
  TEXT = 'Text',
  IMAGE = 'Image',
  VIDEO = 'Video',
  AUDIO = 'Audio',
  FILE = 'File',
  /** @deprecated - Use `MediaEmbed` Instead */
  GIF = 'GIF',
  MEDIA_EMBED = 'MediaEmbed',
  META = 'Meta',
  REACTION = 'Reaction',
  RECEIPT = 'Receipt',
  USER_ACTIVITY = 'UserActivity',
  INTENT = 'Intent',
  REPLY = 'Reply',
  COMPOSITE = 'Composite',
  PAYMENT = 'Payment',
}

export const ALPHA_FEATURES = {
  SCALABILITY_V2: 'SCALABILITY_V2',
};

export const PACKAGE_BUILD = packageJson.version.includes('alpha')
  ? 'ALPHA'
  : 'STABLE';

const Constants = {
  ENV,
  ENCRYPTION_TYPE,
  PAGINATION: {
    INITIAL_PAGE: 1,
    LIMIT: 10,
    LIMIT_MIN: 1,
    LIMIT_MAX: 50,
  },
  DEFAULT_CHAIN_ID: 11155111,
  DEV_CHAIN_ID: 99999,
  NON_ETH_CHAINS: [
    137, 80002, 56, 97, 10, 11155420, 2442, 1101, 421614, 42161, 122, 123,
    80085,59141, 59144, 111557560,7560
  ],
  ETH_CHAINS: [1, 11155111],
  ENC_TYPE_V1: 'x25519-xsalsa20-poly1305',
  ENC_TYPE_V2: 'aes256GcmHkdfSha256',
  ENC_TYPE_V3: 'eip191-aes256-gcm-hkdf-sha256',
  ENC_TYPE_V4: 'pgpv1:nft',
  ENC_TYPE_V5: 'pgpv1:scw',
  ALPHA_FEATURES,
};

export default Constants;
