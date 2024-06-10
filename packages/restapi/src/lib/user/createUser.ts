import {
  IPGPHelper,
  PGPHelper,
  createUserService,
  generateRandomSecret,
  getAccountAddress,
  getWallet,
} from '../chat/helpers';
import { ENV, ENCRYPTION_TYPE } from '../constants';
import {
  isValidPushCAIP,
  encryptPGPKey,
  preparePGPPublicKey,
  isValidNFTCAIP,
  validatePssword,
  isValidSCWCAIP,
  convertToValidDID,
} from '../helpers';
import {
  SignerType,
  encryptedPrivateKeyType,
  ProgressHookType,
  IUser,
  ProgressHookTypeFunction,
} from '../types';
import PROGRESSHOOK from '../progressHook';

export type CreateUserProps = {
  env?: ENV;
  account?: string;
  signer?: SignerType;
  version?: `${ENCRYPTION_TYPE}`;
  additionalMeta?: {
    NFTPGP_V1?: {
      password: string;
    };
    SCWPGP_V1?: {
      password: string;
    };
  };
  progressHook?: (progress: ProgressHookType) => void;
  origin?: string | null;
};

interface ICreateUser extends IUser {
  decryptedPrivateKey?: string;
}

export const create = async (
  options: CreateUserProps
): Promise<ICreateUser> => {
  return await createUserCore(options, PGPHelper);
};

export const createUserCore = async (
  options: CreateUserProps,
  pgpHelper: IPGPHelper
): Promise<ICreateUser> => {
  const passPrefix = '$0Pc'; //password prefix to ensure password validation
  const {
    env = ENV.STAGING,
    account = null,
    signer = null,
    version = ENCRYPTION_TYPE.PGP_V3,
    additionalMeta = {
      NFTPGP_V1: {
        password: passPrefix + generateRandomSecret(10),
      },
      // TODO: Remove Later
      SCWPGP_V1: {
        password: passPrefix + generateRandomSecret(10),
      },
    },
    progressHook,
    origin,
  } = options || {};

  try {
    if (account == null && signer == null) {
      throw new Error(`At least one from account or signer is necessary!`);
    }

    const wallet = getWallet({ account, signer });
    const address = await getAccountAddress(wallet);

    if (!isValidPushCAIP(address)) {
      throw new Error(`Invalid address!`);
    }

    const pushAccount = await convertToValidDID(address, env, signer);
    // TODO: Remove Later
    console.log(pushAccount);
    const encryptionType = encryptionVersionForDID(
      version,
      pushAccount,
      signer
    );

    if (additionalMeta?.NFTPGP_V1?.password) {
      validatePssword(additionalMeta.NFTPGP_V1.password);
    }
    if (additionalMeta?.SCWPGP_V1?.password) {
      validatePssword(additionalMeta.SCWPGP_V1.password);
    }

    // Report Progress
    progressHook?.(PROGRESSHOOK['PUSH-CREATE-01'] as ProgressHookType);
    const keyPairs = await pgpHelper.generateKeyPair();

    // Report Progress
    progressHook?.(PROGRESSHOOK['PUSH-CREATE-02'] as ProgressHookType);
    const publicKey: string = await preparePGPPublicKey(
      encryptionType,
      keyPairs.publicKeyArmored,
      wallet
    );

    // Report Progress
    progressHook?.(PROGRESSHOOK['PUSH-CREATE-03'] as ProgressHookType);
    const encryptedPrivateKey: encryptedPrivateKeyType = await encryptPGPKey(
      encryptionType,
      keyPairs.privateKeyArmored,
      wallet,
      additionalMeta
    );
    // TODO: Remove Later
    console.log(encryptedPrivateKey);

    // Report Progress
    progressHook?.(PROGRESSHOOK['PUSH-CREATE-04'] as ProgressHookType);
    const body = {
      user: pushAccount,
      wallet,
      publicKey: publicKey,
      encryptedPrivateKey: JSON.stringify(encryptedPrivateKey),
      env,
      origin: origin,
    };
    const createdUser: ICreateUser = await createUserService(body);

    // Report Progress
    progressHook?.(PROGRESSHOOK['PUSH-CREATE-05'] as ProgressHookType);
    createdUser.decryptedPrivateKey = keyPairs.privateKeyArmored;
    return createdUser;
  } catch (err) {
    // TODO: Remove Later
    console.log(err);
    // Report Progress
    const errorProgressHook = PROGRESSHOOK[
      'PUSH-ERROR-00'
    ] as ProgressHookTypeFunction;
    progressHook?.(errorProgressHook(create.name, err));
    throw Error(`[Push SDK] - API - Error - API ${create.name} -: ${err}`);
  }
};

const encryptionVersionForDID = (
  version: `${ENCRYPTION_TYPE}`,
  wallet: string,
  signer: SignerType | null
) => {
  if (isValidNFTCAIP(wallet)) return ENCRYPTION_TYPE.NFTPGP_V1;
  if (isValidSCWCAIP(wallet)) return ENCRYPTION_TYPE.SCWPGP_V1;
  if (!signer) return ENCRYPTION_TYPE.PGP_V1;
  return version;
};
