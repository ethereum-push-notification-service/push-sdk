import {
  IPGPHelper,
  PGPHelper,
  createUserService,
  generateRandomSecret,
  getAccountAddress,
  getWallet,
} from '../chat/helpers';
import Constants, { ENV } from '../constants';
import {
  isValidPushCAIP,
  walletToPCAIP10,
  encryptPGPKey,
  preparePGPPublicKey,
  isValidNFTCAIP,
  validatePssword,
} from '../helpers';
import {
  SignerType,
  encryptedPrivateKeyType,
  ProgressHookType,
  IUser,
  encryptedPrivateKeyTypeV2,
  ProgressHookTypeFunction,
} from '../types';
import PROGRESSHOOK from '../progressHook';

export type CreateUserProps = {
  env?: ENV;
  account?: string;
  signer?: SignerType;
  version?: typeof Constants.ENC_TYPE_V1 | typeof Constants.ENC_TYPE_V3;
  additionalMeta?: {
    NFTPGP_V1?: {
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
    env = Constants.ENV.PROD,
    account = null,
    signer = null,
    version = Constants.ENC_TYPE_V3,
    additionalMeta = {
      NFTPGP_V1: {
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
    if (additionalMeta?.NFTPGP_V1?.password) {
      validatePssword(additionalMeta.NFTPGP_V1.password);
    }

    const caip10: string = walletToPCAIP10(address);
    let encryptionType = version;

    if (isValidNFTCAIP(caip10)) {
      // upgrade to v4 (nft encryption)
      encryptionType = Constants.ENC_TYPE_V4;
    } else {
      // downgrade to v1
      if (!signer) encryptionType = Constants.ENC_TYPE_V1;
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
    if (encryptionType === Constants.ENC_TYPE_V4) {
      const encryptedPassword: encryptedPrivateKeyTypeV2 = await encryptPGPKey(
        Constants.ENC_TYPE_V3,
        additionalMeta.NFTPGP_V1?.password as string,
        wallet,
        additionalMeta
      );
      encryptedPrivateKey.encryptedPassword = encryptedPassword;
    }

    // Report Progress
    progressHook?.(PROGRESSHOOK['PUSH-CREATE-04'] as ProgressHookType);
    const body = {
      user: caip10,
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
    // Report Progress
    const errorProgressHook = PROGRESSHOOK[
      'PUSH-ERROR-00'
    ] as ProgressHookTypeFunction;
    progressHook?.(errorProgressHook(create.name, err));
    throw Error(`[Push SDK] - API - Error - API ${create.name} -: ${err}`);
  }
};
