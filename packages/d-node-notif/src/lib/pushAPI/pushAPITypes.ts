import Constants, { ENV } from '../constants';
import { ProgressHookType } from '../types';

export interface PushAPIInitializeProps {
  env?: ENV;
  progressHook?: (progress: ProgressHookType) => void;
  account?: string | null;
  version?: typeof Constants.ENC_TYPE_V1 | typeof Constants.ENC_TYPE_V3;
  versionMeta?: { NFTPGP_V1?: { password: string } };
  autoUpgrade?: boolean;
  origin?: string;
  alpha?: {
    feature: string[];
  };
  decryptedPGPPrivateKey?: string | null;
}

export interface InfoOptions {
  overrideAccount?: string;
}
