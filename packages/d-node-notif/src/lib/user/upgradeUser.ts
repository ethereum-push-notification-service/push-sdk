import { getAccountAddress, getWallet } from '../chat/helpers';
import Constants, { ENV } from '../constants';
import { isValidPushCAIP, decryptPGPKey } from '../helpers';
import {
  SignerType,
  IUser,
  ProgressHookType,
  ProgressHookTypeFunction,
} from '../types';
import { authUpdate } from './auth.updateUser';
import { get } from './getUser';
import PROGRESSHOOK from '../progressHook';

export type UpgradeUserProps = {
  env?: ENV;
  account?: string;
  signer: SignerType;
  additionalMeta?: {
    NFTPGP_V1?: {
      password: string;
    };
  };
  progressHook?: (progress: ProgressHookType) => void;
};

/**
 * Upgrades the Push Profile keys from current version to recommended version
 * @param options
 * @returns
 */
export const upgrade = async (options: UpgradeUserProps): Promise<IUser> => {
  const {
    env = Constants.ENV.PROD,
    account = null,
    signer,
    additionalMeta,
    progressHook,
  } = options || {};

  try {
    const wallet = getWallet({ account, signer });
    const address = await getAccountAddress(wallet);

    if (!isValidPushCAIP(address)) {
      throw new Error(`Invalid address!`);
    }

    const user: IUser = await get({ account: address, env: env });

    if (!user || !user.encryptedPrivateKey) {
      throw new Error('User Not Found!');
    }

    const recommendedPgpEncryptionVersion =
      Constants.USER.ENCRYPTION_TYPE.PGP_V3;
    const { version } = JSON.parse(user.encryptedPrivateKey);

    if (
      version === recommendedPgpEncryptionVersion ||
      version === Constants.USER.ENCRYPTION_TYPE.NFTPGP_V1
    ) {
      return user;
    }

    // Report Progress
    progressHook?.(PROGRESSHOOK['PUSH-UPGRADE-02'] as ProgressHookType);
    const pgpPrivateKey = await decryptPGPKey({
      encryptedPGPPrivateKey: user.encryptedPrivateKey,
      signer: signer,
      env,
      toUpgrade: false,
      additionalMeta,
    });

    const upgradedUser = await authUpdate({
      pgpPrivateKey, // decrypted pgp priv key
      pgpEncryptionVersion: recommendedPgpEncryptionVersion,
      signer,
      pgpPublicKey: user.publicKey,
      account: user.did,
      env,
      additionalMeta: additionalMeta,
      progressHook: progressHook,
    });

    // Report Progress
    progressHook?.(PROGRESSHOOK['PUSH-UPGRADE-05'] as ProgressHookType);
    return upgradedUser;
  } catch (err) {
    // Report Progress
    const errorProgressHook = PROGRESSHOOK[
      'PUSH-ERROR-00'
    ] as ProgressHookTypeFunction;
    progressHook?.(errorProgressHook(upgrade.name, err));
    throw Error(`[Push SDK] - API - Error - API ${upgrade.name} -: ${err}`);
  }
};
