import * as metamaskSigUtil from '@metamask/eth-sig-util';
import {
  decrypt as metamaskDecrypt,
  getEncryptionPublicKey,
} from '@metamask/eth-sig-util';
import * as CryptoJS from 'crypto-js';
import { ethers } from 'ethers';
import {
  aesDecrypt,
  getAccountAddress,
  getWallet,
  pgpDecrypt,
  verifySignature,
  getSignature,
} from '../chat/helpers';
import Constants, { ENV } from '../constants';
import {
  SignerType,
  walletType,
  encryptedPrivateKeyType,
  encryptedPrivateKeyTypeV2,
  IMessageIPFS,
} from '../types';
import { isValidETHAddress, pCAIP10ToWallet } from './address';
import { verifyEip712Signature } from '../chat/helpers/signature';
import { upgrade } from '../user/upgradeUser';

const KDFSaltSize = 32; // bytes
const AESGCMNonceSize = 12; // property iv

let crypto: Crypto;
if (typeof window !== 'undefined' && window.crypto) {
  crypto = window.crypto;
} else if (typeof require !== 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    crypto = require('crypto').webcrypto;
  } catch (e) {
    throw new Error('Unable To load crypto');
  }
}

/** DEPRECATED */
export const getPublicKey = async (options: walletType): Promise<string> => {
  const { account, signer } = options || {};
  const address: string = account || (await signer?.getAddress()) || '';
  const metamaskProvider = new ethers.providers.Web3Provider(
    (window as any).ethereum
  );
  const web3Provider = signer?.provider || metamaskProvider;

  const keyB64 = await web3Provider.provider.request({
    method: 'eth_getEncryptionPublicKey',
    params: [address],
  });
  return keyB64;
};

/** DEPRECATED */
// x25519-xsalsa20-poly1305 enryption
export const encryptV1 = (
  text: string,
  encryptionPublicKey: string,
  version: string
) => {
  const encryptedSecret = metamaskSigUtil.encrypt({
    publicKey: encryptionPublicKey,
    data: text,
    version: version,
  });

  return encryptedSecret;
};

/** DEPRECATED */
export const decryptWithWalletRPCMethod = async (
  encryptedPGPPrivateKey: string,
  account: string
) => {
  console.warn(
    'decryptWithWalletRPCMethod method is DEPRECATED. Use decryptPGPKey method with signer!'
  );
  return await decryptPGPKey({
    encryptedPGPPrivateKey,
    account,
  });
};

type decryptPgpKeyProps = {
  encryptedPGPPrivateKey: string;
  account?: string;
  signer?: SignerType;
  env?: ENV;
  toUpgrade?: boolean;
};

export const decryptPGPKey = async (options: decryptPgpKeyProps) => {
  const {
    encryptedPGPPrivateKey,
    account = null,
    signer = null,
    env = Constants.ENV.PROD,
    toUpgrade = false
  } = options || {};
  try {
    if (account == null && signer == null) {
      throw new Error(`At least one from account or signer is necessary!`);
    }

    const wallet = getWallet({ account, signer });
    const address = await getAccountAddress(wallet);

    if (!isValidETHAddress(address)) {
      throw new Error(`Invalid address!`);
    }

    const { version: encryptionType } = JSON.parse(encryptedPGPPrivateKey);
    let privateKey;

    switch (encryptionType) {
      case Constants.ENC_TYPE_V1: {
        if (wallet?.signer?.privateKey) {
          privateKey = metamaskDecrypt({
            encryptedData: JSON.parse(encryptedPGPPrivateKey),
            privateKey: wallet?.signer?.privateKey.substring(2),
          });
        } else {
          const metamaskProvider = new ethers.providers.Web3Provider(
            (window as any).ethereum
          );
          const web3Provider = signer?.provider || metamaskProvider;
          privateKey = await web3Provider.provider.request({
            method: 'eth_decrypt',
            params: [encryptedPGPPrivateKey, address],
          });
        }
        if (signer && toUpgrade) {
          try {
            await upgrade({ env, account: address, signer });
          } catch (err) {
            console.error(
              `[Push SDK] - API  - Error - API decrypt Pgp Key() -: Unable To UpgradeUser`,
              err
            );
          }
        }
        break;
      }
      case Constants.ENC_TYPE_V2: {
        if (!wallet?.signer) {
          throw new Error(
            'Cannot Decrypt this encryption version without signer!'
          );
        }
        const { preKey: input } = JSON.parse(encryptedPGPPrivateKey);
        const enableProfileMessage = 'Enable Push Chat Profile \n' + input;
        let encodedPrivateKey: Uint8Array;
        try {
          const { verificationProof: secret } = await getSignature(
            address,
            wallet,
            enableProfileMessage,
            false
          );
          encodedPrivateKey = await decryptV2(
            JSON.parse(encryptedPGPPrivateKey),
            hexToBytes(secret || '')
          );
        }
        catch(err) {
          const { verificationProof: secret } = await getSignature(
            address,
            wallet,
            enableProfileMessage,
            true
          );
          encodedPrivateKey = await decryptV2(
            JSON.parse(encryptedPGPPrivateKey),
            hexToBytes(secret || '')
          );
        }
        const dec = new TextDecoder();
        privateKey = dec.decode(encodedPrivateKey);
        break;
      }
      default:
        throw new Error('Invalid Encryption Type');
    }
    return privateKey;
  } catch (err) {
    console.error(
      `[Push SDK] - API  - Error - API decrypt Pgp Key() -:  `,
      err
    );
    throw Error(`[Push SDK] - API  - Error - API decrypt Pgp Key() -: ${err}`);
  }
};

export const decryptMessage = async ({
  encryptedPGPPrivateKey,
  encryptionType,
  encryptedSecret,
  pgpPrivateKey,
  signature,
  signatureValidationPubliKey,
  message,
}: {
  encryptedPGPPrivateKey: string;
  encryptionType: string;
  encryptedSecret: string;
  pgpPrivateKey: string;
  signature: string;
  signatureValidationPubliKey: string;
  message: IMessageIPFS;
}): Promise<string> => {
  let plainText: string;
  if (encryptionType !== 'PlainText' && encryptionType !== null) {
    try {
      plainText = await decryptAndVerifySignature({
        cipherText: encryptedPGPPrivateKey,
        encryptedSecretKey: encryptedSecret,
        privateKeyArmored: pgpPrivateKey,
        publicKeyArmored: signatureValidationPubliKey,
        signatureArmored: signature,
        message: message,
      });
    } catch (err) {
      plainText = 'Unable to decrypt message';
    }
  } else {
    plainText = encryptedPGPPrivateKey;
  }

  return plainText;
};

export const decryptAndVerifySignature = async ({
  cipherText,
  encryptedSecretKey,
  publicKeyArmored,
  signatureArmored,
  privateKeyArmored,
  message,
}: {
  cipherText: string;
  encryptedSecretKey: string;
  publicKeyArmored: string;
  signatureArmored: string;
  privateKeyArmored: string;
  message: IMessageIPFS;
}): Promise<string> => {
  // const privateKeyArmored: string = await DIDHelper.decrypt(JSON.parse(encryptedPrivateKeyArmored), did)
  const secretKey: string = await pgpDecrypt({
    cipherText: encryptedSecretKey,
    toPrivateKeyArmored: privateKeyArmored,
  });
  if (message.link == null) {
    const bodyToBeHashed = {
      fromDID: message.fromDID,
      toDID: message.toDID,
      messageContent: message.messageContent,
      messageType: message.messageType,
    };
    const hash = CryptoJS.SHA256(JSON.stringify(bodyToBeHashed)).toString();
    try {
      await verifySignature({
        messageContent: hash,
        signatureArmored,
        publicKeyArmored,
      });
    } catch (err) {
      await verifySignature({
        messageContent: cipherText,
        signatureArmored,
        publicKeyArmored,
      });
    }
  } else {
    await verifySignature({
      messageContent: cipherText,
      signatureArmored,
      publicKeyArmored,
    });
  }
  return aesDecrypt({ cipherText, secretKey });
};

export const generateHash = (message: any): string => {
  const hash = CryptoJS.SHA256(JSON.stringify(message)).toString(
    CryptoJS.enc.Hex
  );
  return hash;
};

const getRandomValues = async (array: Uint8Array) => {
  return crypto.getRandomValues(array);
};

const bytesToHex = (bytes: Uint8Array): string => {
  return bytes.reduce(
    (str, byte) => str + byte.toString(16).padStart(2, '0'),
    ''
  );
};

const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
};

// Derive AES-256-GCM key from a shared secret and salt
const hkdf = async (
  secret: Uint8Array,
  salt: Uint8Array
): Promise<CryptoKey> => {
  const key = await crypto.subtle.importKey('raw', secret, 'HKDF', false, [
    'deriveKey',
  ]);
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt, info: new ArrayBuffer(0) },
    key,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

// aes256GcmHkdfSha256 encryption
const encryptV2 = async (
  data: Uint8Array,
  secret: Uint8Array,
  additionalData?: Uint8Array
): Promise<encryptedPrivateKeyTypeV2> => {
  const salt = crypto.getRandomValues(new Uint8Array(KDFSaltSize));
  const nonce = crypto.getRandomValues(new Uint8Array(AESGCMNonceSize));
  const key = await hkdf(secret, salt);

  const aesGcmParams: AesGcmParams = {
    name: 'AES-GCM',
    iv: nonce,
  };
  if (additionalData) {
    aesGcmParams.additionalData = additionalData;
  }
  const encrypted: ArrayBuffer = await crypto.subtle.encrypt(
    aesGcmParams,
    key,
    data
  );
  return {
    ciphertext: bytesToHex(new Uint8Array(encrypted)),
    version: 'aes256GcmHkdfSha256',
    salt: bytesToHex(salt),
    nonce: bytesToHex(nonce),
    preKey: '',
  };
};

// aes256GcmHkdfSha256 decryption
const decryptV2 = async (
  encryptedData: encryptedPrivateKeyTypeV2,
  secret: Uint8Array,
  additionalData?: Uint8Array
): Promise<Uint8Array> => {
  const key = await hkdf(secret, hexToBytes(encryptedData.salt));
  const aesGcmParams: AesGcmParams = {
    name: 'AES-GCM',
    iv: hexToBytes(encryptedData.nonce),
  };
  if (additionalData) {
    aesGcmParams.additionalData = additionalData;
  }
  const decrypted: ArrayBuffer = await crypto.subtle.decrypt(
    aesGcmParams,
    key,
    hexToBytes(encryptedData.ciphertext)
  );
  return new Uint8Array(decrypted);
};

export const encryptPGPKey = async (
  encryptionType: string,
  privateKey: string,
  address: string,
  wallet: walletType
): Promise<encryptedPrivateKeyType> => {
  let encryptedPrivateKey: encryptedPrivateKeyType;
  switch (encryptionType) {
    case Constants.ENC_TYPE_V1: {
      let walletPublicKey: string;
      if (wallet?.signer?.privateKey) {
        // get metamask specific encryption public key
        walletPublicKey = getEncryptionPublicKey(
          wallet?.signer?.privateKey.substring(2)
        );
      } else {
        // wallet popup will happen to get encryption public key
        walletPublicKey = await getPublicKey(wallet);
      }
      encryptedPrivateKey = encryptV1(
        privateKey,
        walletPublicKey,
        encryptionType
      );
      break;
    }
    case Constants.ENC_TYPE_V2: {
      const input = bytesToHex(await getRandomValues(new Uint8Array(32)));
      const enableProfileMessage = 'Enable Push Chat Profile \n' + input;
      const { verificationProof: secret } = await getSignature(
        address,
        wallet,
        enableProfileMessage,
        false
      );
      const enc = new TextEncoder();
      const encodedPrivateKey = enc.encode(privateKey);
      encryptedPrivateKey = await encryptV2(
        encodedPrivateKey,
        hexToBytes(secret || '')
      );
      encryptedPrivateKey.preKey = input;
      break;
    }
    default:
      throw new Error('Invalid Encryption Type');
  }
  return encryptedPrivateKey;
};

export const preparePGPPublicKey = async (
  encryptionType: string,
  publicKey: string,
  address: string,
  wallet: walletType
): Promise<string> => {
  let chatPublicKey: string;
  switch (encryptionType) {
    case Constants.ENC_TYPE_V1: {
      chatPublicKey = publicKey;
      break;
    }
    case Constants.ENC_TYPE_V2: {
      const createProfileMessage =
        'Create Push Chat Profile \n' + generateHash(publicKey);
      const { verificationProof } = await getSignature(
        address,
        wallet,
        createProfileMessage,
        false
      );
      chatPublicKey = JSON.stringify({
        key: publicKey,
        signature: verificationProof,
      });
      break;
    }
    default:
      throw new Error('Invalid Encryption Type');
  }
  return chatPublicKey;
};

export const verifyPGPPublicKey = (
  encryptionType: string,
  publicKey: string,
  address: string
): string => {
  if (encryptionType === Constants.ENC_TYPE_V2) {
    const { key, signature: verificationProof } = JSON.parse(publicKey);
    publicKey = key;
    const signedData = 'Create Push Chat Profile \n' + generateHash(key);
    if (
      verifyEip712Signature(
        verificationProof,
        signedData,
        pCAIP10ToWallet(address)
      )
    )
      return publicKey;
    else throw new Error('Cannot verify Encryption Keys for this user');
  }
  return publicKey;
};
