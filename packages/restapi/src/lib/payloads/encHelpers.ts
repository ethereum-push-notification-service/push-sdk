import * as CryptoJS from 'crypto-js';
import * as openpgp from 'openpgp';
import EthCrypto from 'eth-crypto';
/**
 * @description Generates a nonce
 * @param length desired length of the nonce
 * @returns Returns a nonce of alphanumeric characters
 */
export const generateRandomNonce = (length: number): string => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/**
 * @description Encrypt the paylaod with nonce
 * @param payload.message stringified payload
 * @param payload.secret generated nonce
 */
export const aesEncryption = (payload: { message: string; secret: string }) => {
  const { message, secret } = payload;
  return CryptoJS.AES.encrypt(message, secret).toString();
};

/**
 * @description Decrypt the paylaod via nonce
 * @param payload.encryptedMessage stringified payload
 * @param payload.secret generated nonce
 */
export const aesDecryption = (payload: {
  encryptedMessage: string;
  secret: string;
}) => {
  try {
    const { encryptedMessage, secret } = payload;
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, secret);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return '';
  }
};

/**
 * @description Encrypt the secret nonce with pgp key
 * @param  text the text to be encrypted
 * @param keys the array of pgp public keys that will be used to encrypt the text
 * @returns
 */
export const encryptViaPGP = async ({
  text,
  keys
}: {
  text: string;
  keys: Array<string>;
}): Promise<string> => {
  const pgpKeys: openpgp.Key[] = [];

  for (let i = 0; i < keys.length; i++) {
    pgpKeys.push(await openpgp.readKey({ armoredKey: keys[i] }));
  }
  const message: openpgp.Message<string> = await openpgp.createMessage({
    text
  });
  const encrypted: string = <string>await openpgp.encrypt({
    message: message,
    encryptionKeys: pgpKeys
  });
  return encrypted;
};

export const decryptViaPGP = async ({
  cipherText,
  pgpPrivateKey
}: {
  cipherText: any;
  pgpPrivateKey: string;
}): Promise<string> => {
  const message = await openpgp.readMessage({ armoredMessage: cipherText });
  const privateKey: openpgp.PrivateKey = await openpgp.readPrivateKey({
    armoredKey: pgpPrivateKey
  });

  const { data: decrypted } = await openpgp.decrypt({
    message,
    decryptionKeys: privateKey
  });

  return decrypted as string;
};

export const encryptViaPK = async (options: {
  publicKey: string;
  message: string;
}) => {
  try {
    const { publicKey, message } = options || {};
    let publickKeyWithout0x;
    if (publicKey.startsWith('0x')) {
      publickKeyWithout0x = publicKey.split('0x')[1];
    } else {
      publickKeyWithout0x = publicKey;
    }
    const encyptedData = await EthCrypto.encryptWithPublicKey(
      publickKeyWithout0x,
      message
    );
    return EthCrypto.cipher.stringify(encyptedData);
  } catch (error) {
    return null;
  }
};

export const decryptViaPK = async (options: {
  privateKey: string;
  encMessage: string;
}) => {
  try {
    const { privateKey, encMessage } = options || {};
    return await EthCrypto.decryptWithPrivateKey(
      privateKey,
      EthCrypto.cipher.parse(encMessage)
    );
  } catch (error) {
    return null;
  }
};
