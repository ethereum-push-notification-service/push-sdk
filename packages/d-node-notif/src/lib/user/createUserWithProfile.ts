import { create } from './createUser';
import { IUser, ProgressHookType, SignerType } from '../types';
import { profileUpdate } from './profile.updateUser';
import { decryptPGPKey } from '../../../src/lib/helpers';
import Constants, { ENV } from '../constants';

export type CreateUserPropsWithProfile = {
  env?: ENV;
  account?: string;
  signer?: SignerType;
  version?: typeof Constants.ENC_TYPE_V1 | typeof Constants.ENC_TYPE_V3;
  additionalMeta?: {
    NFTPGP_V1?: {
      password: string;
    };
  };
  profile?: {
    name?: string;
    desc?: string;
    picture?: string;
    blockedUsersList?: Array<string>;
  };
  progressHook?: (progress: ProgressHookType) => void;
};

export const createUserWithProfile = async (
  userOptions: CreateUserPropsWithProfile
): Promise<IUser> => {
  try {
    let user = await create(userOptions);

    if (userOptions.profile) {
      const pk = await decryptPGPKey({
        account: user.did,
        encryptedPGPPrivateKey: user.encryptedPrivateKey,
        env: userOptions.env,
        signer: userOptions.signer,
      });


      user = await profileUpdate({
        account: user.did,
        env: userOptions.env,
        pgpPrivateKey: pk,
        profile: userOptions.profile
      });
    }
    return user;
  } catch (err) {
    throw new Error(`[Push SDK] - Error in createUserWithProfile -: ${err}`);
  }
};
