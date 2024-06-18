import * as PGP from './pgp';
import * as AES from './aes';
import * as CryptoJS from 'crypto-js';
import { walletType } from '../../types';
import { get } from '../../user';
import {
  Signer,
  decryptPGPKey,
  decryptWithWalletRPCMethod,
  isValidPushCAIP,
} from '../../helpers';
import { get as getUser } from '../../user';
import { createUserService } from './service';
import Constants, { ENV } from '../../constants';
import { getDomainInformation, getTypeInformation } from './signature';
import { IPGPHelper } from './pgp';

const SIG_TYPE_V2 = 'eip712v2';

export const encryptAndSign = async ({
  plainText,
  keys,
  privateKeyArmored,
  secretKey,
}: {
  plainText: string;
  keys: Array<string>;
  privateKeyArmored: string;
  secretKey: string;
}): Promise<{
  cipherText: string;
  encryptedSecret: string;
  signature: string;
  sigType: string;
  encType: string;
}> => {
  return await encryptAndSignCore({
    plainText,
    keys,
    privateKeyArmored,
    secretKey,
    pgpHelper: PGP.PGPHelper,
  });
};

export const encryptAndSignCore = async ({
  plainText,
  keys,
  privateKeyArmored,
  secretKey,
  pgpHelper,
}: {
  plainText: string;
  keys: Array<string>;
  privateKeyArmored: string;
  secretKey: string;
  pgpHelper: PGP.IPGPHelper;
}): Promise<{
  cipherText: string;
  encryptedSecret: string;
  signature: string;
  sigType: string;
  encType: string;
}> => {
  const cipherText: string = AES.aesEncrypt({ plainText, secretKey });
  const encryptedSecret = await pgpHelper.pgpEncrypt({
    plainText: secretKey,
    keys: keys,
  });
  const signature: string = await pgpHelper.sign({
    message: cipherText,
    signingKey: privateKeyArmored,
  });
  return {
    cipherText,
    encryptedSecret,
    signature,
    sigType: 'pgp',
    encType: 'pgp',
  };
};

export const signMessageWithPGP = async ({
  message,
  privateKeyArmored,
}: {
  message: string;
  privateKeyArmored: string;
}): Promise<{
  signature: string;
  sigType: string;
}> => {
  return await signMessageWithPGPCore({
    message,
    privateKeyArmored,
    pgpHelper: PGP.PGPHelper,
  });
};

export const signMessageWithPGPCore = async ({
  message,
  privateKeyArmored,
  pgpHelper,
}: {
  message: string;
  privateKeyArmored: string;
  pgpHelper: PGP.IPGPHelper;
}): Promise<{
  signature: string;
  sigType: string;
}> => {
  const signature: string = await pgpHelper.sign({
    message: message,
    signingKey: privateKeyArmored,
  });

  return {
    signature,
    sigType: 'pgp',
  };
};

export const getEip191Signature = async (
  wallet: walletType,
  message: string,
  version: 'v1' | 'v2' = 'v1'
) => {
  if (!wallet?.signer) {
    console.warn('This method is deprecated. Provide signer in the function');
    // sending random signature for making it backward compatible
    return { signature: 'xyz', sigType: 'a' };
  }
  const _signer = wallet?.signer;
  // EIP191 signature

  const pushSigner = new Signer(_signer);
  const signature = await pushSigner.signMessage(message);
  const sigType = version === 'v1' ? 'eip191' : 'eip191v2';
  return { verificationProof: `${sigType}:${signature}` };
};

export const getEip712Signature = async (
  wallet: walletType,
  hash: string,
  isDomainEmpty: boolean
) => {
  if (!wallet?.signer) {
    console.warn('This method is deprecated. Provide signer in the function');
    // sending random signature for making it backward compatible
    return { signature: 'xyz', sigType: 'a' };
  }

  const typeInformation = getTypeInformation();
  const _signer = wallet?.signer;
  const pushSigner = new Signer(_signer);
  let chainId: number;
  try {
    chainId = await pushSigner.getChainId();
  } catch (err) {
    chainId = 1;
  }
  const domain = getDomainInformation(chainId);

  // sign a message using EIP712
  const signedMessage = await pushSigner.signTypedData(
    isDomainEmpty ? {} : domain,
    typeInformation,
    { data: hash },
    'Data'
  );
  const verificationProof = isDomainEmpty
    ? `${SIG_TYPE_V2}:${signedMessage}`
    : `${SIG_TYPE_V2}:${chainId}:${signedMessage}`;
  return { verificationProof };
};

export async function getDecryptedPrivateKey(
  wallet: walletType,
  user: any,
  address: string,
  env: ENV
): Promise<string> {
  let decryptedPrivateKey;
  if (wallet.signer) {
    decryptedPrivateKey = await decryptPGPKey({
      signer: wallet.signer,
      encryptedPGPPrivateKey: user.encryptedPrivateKey,
      env,
    });
  } else {
    decryptedPrivateKey = await decryptWithWalletRPCMethod(
      user.encryptedPrivateKey,
      address
    );
  }
  return decryptedPrivateKey;
}
