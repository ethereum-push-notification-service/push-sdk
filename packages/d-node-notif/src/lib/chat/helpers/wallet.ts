import { Signer, pCAIP10ToWallet } from '../../helpers';
import { SignerType, walletType } from '../../types';

export const getWallet = (
  options: walletType
): {
  account: string | null;
  signer: SignerType | null;
} => {
  const { account, signer } = options || {};

  return {
    account: account ? pCAIP10ToWallet(account) : account,
    signer,
  };
};

export const getAccountAddress = async (
  options: walletType
): Promise<string> => {
  const { account, signer } = options || {};

  const pushSigner = new Signer(signer as SignerType);
  return account || (await pushSigner.getAddress()) || '';
};
