import Constants from '../../constants';
import { get, create } from '../../user';
import { decryptWithWalletRPCMethod } from '../../helpers';
import { AccountEnvOptionsType, IConnectedUser, IUser } from '../../types';

export const createUserIfNecessary = async (
  options: AccountEnvOptionsType
): Promise<IUser> => {
  const { account, env = Constants.ENV.PROD } = options || {};
  const connectedUser = await get({ account: account, env });
  if (!connectedUser?.encryptedPrivateKey) {
    const createdUser: IUser = await create({ account: account, env });
    return createdUser;
  } else {
    return connectedUser;
  }
};

export const getConnectedUser = async (
  account: string,
  privateKey: string | null,
  env: string
): Promise<IConnectedUser> => {
  const user = await get({ account: account, env: env || Constants.ENV.PROD });
  if (user?.encryptedPrivateKey) {
    if (privateKey) { 
      return { ...user, privateKey };
    }
    else {
      throw new Error(`Decrypted private key required as input`);
    }
  }
  else {
    const newUser = await create({ account, env });
    const decryptedPrivateKey = await decryptWithWalletRPCMethod(
      newUser.encryptedPrivateKey,
      account
    );
    return { ...newUser, privateKey: decryptedPrivateKey };
  }
};
