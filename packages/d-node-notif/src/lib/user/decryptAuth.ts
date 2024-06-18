import Constants, { ENV } from '../constants';
import { decryptPGPKey, isValidNFTCAIP } from '../helpers';
import PROGRESSHOOK from '../progressHook';
import {
  ProgressHookType,
  ProgressHookTypeFunction,
  SignerType,
} from '../types';

type decryptAuthProps = {
  signer: SignerType;
  account?: string;
  env?: ENV;
  additionalMeta?: {
    NFTPGP_V1?: {
      encryptedPassword: string;
    };
  };
  /**
   * To get Progress Related to fn
   */
  progressHook?: (progress: ProgressHookType) => void;
};

/**
 *
 * @returns Decrypted Push Profile Password
 */
export const decryptAuth = async (
  options: decryptAuthProps
): Promise<string | null> => {
  const {
    account,
    signer,
    env = Constants.ENV.PROD,
    additionalMeta,
    progressHook,
  } = options || {};
  try {
    if (!isValidNFTCAIP(account as string)) {
      return null;
    }
    // Report Progress
    progressHook?.(PROGRESSHOOK['PUSH-DECRYPT-AUTH-01'] as ProgressHookType);
    const password = await decryptPGPKey({
      encryptedPGPPrivateKey: additionalMeta?.NFTPGP_V1
        ?.encryptedPassword as string,
      signer,
      account,
      env,
    });

    // Report Progress
    progressHook?.(PROGRESSHOOK['PUSH-DECRYPT-AUTH-02'] as ProgressHookType);
    return password;
  } catch (err) {
    // Report Progress
    progressHook?.(
      (PROGRESSHOOK['PUSH-ERROR-00'] as ProgressHookTypeFunction)(
        decryptAuth.name,
        err
      )
    );
    throw Error(
      `[Push SDK] - API  - Error - API ${decryptAuth.name} -: ${err}`
    );
  }
};
