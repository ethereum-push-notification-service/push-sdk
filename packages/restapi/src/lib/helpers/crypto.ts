import * as metamaskSigUtil from '@metamask/eth-sig-util';
import {
  decrypt as metamaskDecrypt,
  getEncryptionPublicKey,
} from '@metamask/eth-sig-util';
import * as CryptoJS from 'crypto-js';
import {
  getAccountAddress,
  getWallet,
  getEip712Signature,
  getEip191Signature,
} from '../chat/helpers';
import Constants, { ENV } from '../constants';
import {
  SignerType,
  walletType,
  encryptedPrivateKeyType,
  encryptedPrivateKeyTypeV2,
  ProgressHookType,
  ProgressHookTypeFunction,
} from '../types';
import { isValidNFTCAIP, isValidPushCAIP, pCAIP10ToWallet } from './address';
import { verifyProfileSignature } from '../chat/helpers/signature';
import { upgrade } from '../user/upgradeUser';
import PROGRESSHOOK from '../progressHook';
import { Signer } from './signer';
import * as viem from 'viem';
import { mainnet } from 'viem/chains';
import { combine, split } from 'shamir-secret-sharing';
import { Lit } from './lit';

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

/**
 * @deprecated
 */
export const getPublicKey = async (options: walletType): Promise<string> => {
  const { account, signer } = options || {};
  const pushSigner = signer ? new Signer(signer) : undefined;
  const address: string = account || (await pushSigner?.getAddress()) || '';
  const metamaskProvider = viem.createWalletClient({
    chain: mainnet,
    transport: viem.custom((window as any).ethereum),
  });
  const web3Provider: any = signer?.provider?.provider || metamaskProvider;
  const keyB64 = await web3Provider.request({
    method: 'eth_getEncryptionPublicKey',
    params: [address],
  });
  return keyB64;
};

/**
 * @deprecated
 * x25519-xsalsa20-poly1305 enryption
 */
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

/** @deprecated */
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
  signer?: SignerType | null;
  env?: ENV;
  toUpgrade?: boolean;
  additionalMeta?: {
    NFTPGP_V1?: {
      password: string;
    };
  };
  progressHook?: (progress: ProgressHookType) => void;
};

export const decryptPGPKey = async (options: decryptPgpKeyProps) => {
  const {
    encryptedPGPPrivateKey,
    account = null,
    signer = null,
    env = Constants.ENV.PROD,
    toUpgrade = true,
    additionalMeta = null,
    progressHook,
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

    const { version: encryptionType } = JSON.parse(encryptedPGPPrivateKey);
    let privateKey;

    // Report Progress
    progressHook?.(PROGRESSHOOK['PUSH-DECRYPT-01'] as ProgressHookType);

    switch (encryptionType) {
      case Constants.ENC_TYPE_V1: {
        if (wallet?.signer?.privateKey) {
          privateKey = metamaskDecrypt({
            encryptedData: JSON.parse(encryptedPGPPrivateKey),
            privateKey: wallet?.signer?.privateKey.substring(2),
          });
        } else {
          const metamaskProvider = viem.createWalletClient({
            chain: mainnet,
            transport: viem.custom((window as any).ethereum),
          });
          const web3Provider = signer?.provider?.provider || metamaskProvider;
          privateKey = await web3Provider.request({
            method: 'eth_decrypt',
            params: [encryptedPGPPrivateKey, address],
          });
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
          const { verificationProof: secret } = await getEip712Signature(
            wallet,
            enableProfileMessage,
            true
          );
          encodedPrivateKey = await decryptV2(
            JSON.parse(encryptedPGPPrivateKey),
            hexToBytes(secret || '')
          );
        } catch (err) {
          const { verificationProof: secret } = await getEip712Signature(
            wallet,
            enableProfileMessage,
            false
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
      case Constants.ENC_TYPE_V3: {
        if (!wallet?.signer) {
          throw new Error(
            'Cannot Decrypt this encryption version without signer!'
          );
        }
        const { preKey: input } = JSON.parse(encryptedPGPPrivateKey);
        const enableProfileMessage = 'Enable Push Profile \n' + input;
        const { verificationProof: secret } = await getEip191Signature(
          wallet,
          enableProfileMessage
        );
        const encodedPrivateKey = await decryptV2(
          JSON.parse(encryptedPGPPrivateKey),
          hexToBytes(secret || '')
        );
        const dec = new TextDecoder();
        privateKey = dec.decode(encodedPrivateKey);
        break;
      }
      case Constants.ENC_TYPE_V4: {
        let password: string | null = null;
        if (additionalMeta?.NFTPGP_V1) {
          password = additionalMeta.NFTPGP_V1.password;
        } else {
          if (!wallet?.signer) {
            throw new Error(
              'Cannot Decrypt this encryption version without signer!'
            );
          }
          const { encryptedPassword } = JSON.parse(encryptedPGPPrivateKey);
          password = await decryptPGPKey({
            encryptedPGPPrivateKey: JSON.stringify(encryptedPassword),
            signer,
            env,
          });
        }
        const encodedPrivateKey = await decryptV2(
          JSON.parse(encryptedPGPPrivateKey),
          hexToBytes(stringToHex(password as string))
        );
        const dec = new TextDecoder();
        privateKey = dec.decode(encodedPrivateKey);
        break;
      }
      case Constants.ENC_TYPE_V5: {
        const { shardInfo } = JSON.parse(
          encryptedPGPPrivateKey
        ) as encryptedPrivateKeyType;

        if (!shardInfo) {
          throw new Error('Invalid Shard Info');
        }

        const pushShard = shardInfo.shards[0].shard;
        const litEncryptedShard = shardInfo.shards[1].shard;

        const LitInstance = await Lit.createInstance(
          wallet.signer as SignerType,
          wallet.account as string,
          'sepolia',
          env
        );

        const pushSigner = new Signer(wallet.signer as SignerType);
        const chainId = await pushSigner.getChainId();

        const litShard = await LitInstance.decrypt(
          litEncryptedShard.ciphertext,
          litEncryptedShard.dataToEncryptHash,
          chainId
        );

        const secret = await combine([
          hexToBytes(pushShard),
          hexToBytes(litShard),
        ]);

        const encodedPrivateKey = await decryptV2(
          JSON.parse(encryptedPGPPrivateKey),
          secret
        );
        const dec = new TextDecoder();
        privateKey = dec.decode(encodedPrivateKey);
        break;
      }
      default:
        throw new Error('Invalid Encryption Type');
    }

    // try key upgradation
    if (
      signer &&
      toUpgrade &&
      encryptionType !== Constants.ENC_TYPE_V4 &&
      encryptionType !== Constants.ENC_TYPE_V5
    ) {
      try {
        await upgrade({ env, account: address, signer, progressHook });
      } catch (err) {
        // Report Progress
        const errorProgressHook = PROGRESSHOOK[
          'PUSH-ERROR-01'
        ] as ProgressHookTypeFunction;
        progressHook?.(errorProgressHook(err));
      }
    }

    // Report Progress
    progressHook?.(PROGRESSHOOK['PUSH-DECRYPT-02'] as ProgressHookType);
    return privateKey;
  } catch (err) {
    // TODO: Remove Later
    console.log(err);
    // Report Progress
    const errorProgressHook = PROGRESSHOOK[
      'PUSH-ERROR-00'
    ] as ProgressHookTypeFunction;
    progressHook?.(errorProgressHook(decryptPGPKey.name, err));
    throw Error(
      `[Push SDK] - API - Error - API ${decryptPGPKey.name} -: ${JSON.stringify(
        err
      )}`
    );
  }
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

export const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
};

export const stringToHex = (str: string): string => {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex;
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

/** AES-GCM Encryption */
export const encryptV2 = async (
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
    salt: bytesToHex(salt),
    nonce: bytesToHex(nonce),
  };
};

/** AES-GCM Decryption */
export const decryptV2 = async (
  encryptedData: encryptedPrivateKeyTypeV2,
  secret: Uint8Array,
  additionalData?: Uint8Array
): Promise<Uint8Array> => {
  const key = await hkdf(secret, hexToBytes(encryptedData.salt as string));
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
  wallet: walletType,
  additionalMeta?: {
    NFTPGP_V1?: {
      password: string;
    };
    SCWPGP_V1?: {
      password: string;
    };
  },
  env: ENV = ENV.STAGING
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
      const { verificationProof: secret } = await getEip712Signature(
        wallet,
        enableProfileMessage,
        true
      );
      const enc = new TextEncoder();
      const encodedPrivateKey = enc.encode(privateKey);
      encryptedPrivateKey = await encryptV2(
        encodedPrivateKey,
        hexToBytes(secret || '')
      );
      encryptedPrivateKey.version = Constants.ENC_TYPE_V2;
      encryptedPrivateKey.preKey = input;
      break;
    }
    case Constants.ENC_TYPE_V3: {
      const input = bytesToHex(await getRandomValues(new Uint8Array(32)));
      const enableProfileMessage = 'Enable Push Profile \n' + input;
      const { verificationProof: secret } = await getEip191Signature(
        wallet,
        enableProfileMessage
      );
      const enc = new TextEncoder();
      const encodedPrivateKey = enc.encode(privateKey);
      encryptedPrivateKey = await encryptV2(
        encodedPrivateKey,
        hexToBytes(secret || '')
      );
      encryptedPrivateKey.version = Constants.ENC_TYPE_V3;
      encryptedPrivateKey.preKey = input;
      break;
    }
    case Constants.ENC_TYPE_V4: {
      if (!additionalMeta?.NFTPGP_V1?.password) {
        throw new Error('Password is required!');
      }
      const enc = new TextEncoder();
      const encodedPrivateKey = enc.encode(privateKey);
      encryptedPrivateKey = await encryptV2(
        encodedPrivateKey,
        hexToBytes(stringToHex(additionalMeta.NFTPGP_V1.password))
      );
      encryptedPrivateKey.version = Constants.ENC_TYPE_V4;
      encryptedPrivateKey.preKey = '';
      encryptedPrivateKey.encryptedPassword = await encryptPGPKey(
        Constants.ENC_TYPE_V3,
        additionalMeta.NFTPGP_V1.password,
        wallet
      );
      break;
    }
    case Constants.ENC_TYPE_V5: {
      if (!additionalMeta?.SCWPGP_V1?.password) {
        throw new Error('Password is required!');
      }
      // 1. Generate secret to encrypt private key
      const encryptionSecret = await getRandomValues(new Uint8Array(32));
      // 2. Split secret into 3 shards ( Combining any 2 shards can decrypt the secret )
      const PARTS = 3;
      const QUORUM = 2;
      const [shard1, shard2, shard3] = await split(
        encryptionSecret,
        PARTS,
        QUORUM
      );
      // 3. Encrypt private key with secret
      const enc = new TextEncoder();
      const encodedPrivateKey = enc.encode(privateKey);
      encryptedPrivateKey = await encryptV2(
        encodedPrivateKey,
        encryptionSecret
      );

      encryptedPrivateKey.version = encryptionType;

      // 4. Store shard1 on Push nodes
      const pushShard = bytesToHex(shard1);

      // 5. Encrypt and store shard2 on lit nodes
      const LitInstance = await Lit.createInstance(
        wallet.signer as SignerType,
        wallet.account as string,
        'sepolia',
        env
      );

      const pushSigner = new Signer(wallet.signer as SignerType);
      const chainId = await pushSigner.getChainId();

      const litEncryptedShard = await LitInstance.encrypt(
        bytesToHex(shard2),
        chainId
      );

      // 6. Encrypt and store shard3 on push nodes
      const encodedShard3 = enc.encode(bytesToHex(shard3));
      const pushEncryptedShard = await encryptV2(
        encodedShard3,
        hexToBytes(stringToHex(additionalMeta?.SCWPGP_V1?.password as string))
      );

      encryptedPrivateKey.shardInfo = {
        shards: [
          {
            shard: pushShard,
            encryptionType: 'NONE',
          },
          {
            shard: litEncryptedShard,
            encryptionType: 'LIT_SHARD_ENC_V1',
          },
          {
            shard: pushEncryptedShard,
            encryptionType: 'PUSH_SHARD_ENC_V1',
          },
        ],
        pattern: `${QUORUM}-${PARTS}`,
      };
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
  wallet: walletType
): Promise<string> => {
  let chatPublicKey: string;
  switch (encryptionType) {
    case Constants.ENC_TYPE_V1:
    case Constants.ENC_TYPE_V5: {
      chatPublicKey = publicKey;
      break;
    }
    case Constants.ENC_TYPE_V2:
    case Constants.ENC_TYPE_V3:
    case Constants.ENC_TYPE_V4: {
      const verificationProof = 'DEPRECATED';
      // TODO - Change JSON Structure to string ie equivalent to ENC_TYPE_V1 ( would be done after PUSH Node changes )
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

/**
 * Checks the Push Profile keys using verificationProof
 * @param encryptedPrivateKey
 * @param publicKey
 * @param did
 * @param caip10
 * @param verificationProof
 * @returns PGP Public Key
 */
export const verifyProfileKeys = async (
  encryptedPrivateKey: string,
  publicKey: string,
  did: string,
  caip10: string,
  verificationProof: string
): Promise<string> => {
  let parsedPublicKey: string;
  try {
    parsedPublicKey = JSON.parse(publicKey).key;
    if (parsedPublicKey === undefined) {
      throw new Error('Invalid Public Key');
    }
  } catch (err) {
    parsedPublicKey = publicKey;
  }

  try {
    if (
      publicKey &&
      publicKey.length > 0 &&
      verificationProof &&
      // Allow pgp sig validation after eip191v2 only
      verificationProof.split(':')[0] === 'eip191v2'
    ) {
      const data = {
        caip10,
        did,
        publicKey,
        encryptedPrivateKey,
      };

      if (isValidNFTCAIP(did)) {
        const keyToRemove = 'owner';
        const parsedEncryptedPrivateKey = JSON.parse(encryptedPrivateKey);
        if (keyToRemove in parsedEncryptedPrivateKey) {
          delete parsedEncryptedPrivateKey[keyToRemove];
        }
        data.encryptedPrivateKey = JSON.stringify(parsedEncryptedPrivateKey);
      }

      const signedData = generateHash(data);

      const isValidSig: boolean = await verifyProfileSignature(
        verificationProof,
        signedData,
        isValidNFTCAIP(did)
          ? pCAIP10ToWallet(JSON.parse(encryptedPrivateKey).owner)
          : pCAIP10ToWallet(did)
      );
      if (isValidSig) {
        return parsedPublicKey;
      } else {
        throw new Error('Invalid Signature');
      }
    }
    return parsedPublicKey;
  } catch (err) {
    console.warn(`Cannot Verify keys for DID : ${did} !!!`);
    return parsedPublicKey;
  }
};

export const validatePssword = (password: string) => {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long!');
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error('Password must contain at least one uppercase letter!');
  }
  if (!/[a-z]/.test(password)) {
    throw new Error('Password must contain at least one lowercase letter!');
  }
  if (!/\d/.test(password)) {
    throw new Error('Password must contain at least one digit!');
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    throw new Error('Password must contain at least one special character!');
  }
};
