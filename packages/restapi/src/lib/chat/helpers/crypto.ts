import * as PGP from './pgp';
import * as AES from './aes';
import * as CryptoJS from 'crypto-js';
import {
  IConnectedUser,
  IFeeds,
  IMessageIPFSWithCID,
  IUser,
  GroupDTO,
  walletType,
  IMessageIPFS,
} from '../../types';
import { get } from '../../user';
import {
  decryptPGPKey,
  decryptWithWalletRPCMethod,
  isValidETHAddress,
  walletToPCAIP10,
} from '../../helpers';
import { get as getUser } from '../../user';
import { createUserService } from './service';
import Constants, { ENV } from '../../constants';
import { getDomainInformation, getTypeInformation } from './signature';
import { pgpDecrypt, verifySignature } from './pgp';
import { aesDecrypt } from './aes';

const SIG_TYPE_V2 = 'eip712v2';

interface IEncryptedRequest {
  message: string;
  encryptionType: 'PlainText' | 'pgp';
  aesEncryptedSecret: string;
  signature: string;
}
interface IDecryptMessage {
  savedMsg: IMessageIPFSWithCID;
  connectedUser: IConnectedUser;
  account: string;
  chainId: number;
  currentChat: IFeeds;
  inbox: IFeeds[];
}

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
  const cipherText: string = AES.aesEncrypt({ plainText, secretKey });
  const encryptedSecret = await PGP.pgpEncrypt({
    plainText: secretKey,
    keys: keys,
  });
  const signature: string = await PGP.sign({
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
  const signature: string = await PGP.sign({
    message: message,
    signingKey: privateKeyArmored,
  });

  return {
    signature,
    sigType: 'pgp',
  };
};

export const decryptFeeds = async ({
  feeds,
  connectedUser,
  pgpPrivateKey,
  env = Constants.ENV.PROD,
}: {
  feeds: IFeeds[];
  connectedUser: IUser;
  pgpPrivateKey?: string;
  env: ENV;
}): Promise<IFeeds[]> => {
  let otherPeer: IUser;
  let signatureValidationPubliKey: string; // To do signature verification it depends on who has sent the message
  for (const feed of feeds) {
    let gotOtherPeer = false;
    if (feed.msg.encType !== 'PlainText') {
      if (!pgpPrivateKey) {
        throw Error('Decrypted private key is necessary');
      }
      if (feed.msg.fromCAIP10 !== connectedUser.wallets.split(',')[0]) {
        if (!gotOtherPeer) {
          otherPeer = await getUser({ account: feed.msg.fromCAIP10, env });
          gotOtherPeer = true;
        }
        signatureValidationPubliKey = otherPeer!.publicKey!;
      } else {
        signatureValidationPubliKey = connectedUser.publicKey!;
      }
      feed.msg = await decryptAndVerifyMessage(
        feed.msg,
        signatureValidationPubliKey,
        pgpPrivateKey
      );
    }
  }
  return feeds;
};

export const decryptMessages = async ({
  savedMsg,
  connectedUser,
  account,
  currentChat,
  inbox,
}: IDecryptMessage): Promise<IMessageIPFSWithCID> => {
  if (connectedUser.privateKey) {
    if (savedMsg.encType !== 'PlainText' && savedMsg.encType !== null) {
      // To do signature verification it depends on who has sent the message
      let signatureValidationPubliKey = '';
      if (savedMsg.fromCAIP10 === walletToPCAIP10(account)) {
        signatureValidationPubliKey = connectedUser.publicKey;
      } else {
        if (!currentChat.publicKey) {
          const latestUserInfo = inbox.find(
            (x) => x.wallets.split(',')[0] === currentChat.wallets.split(',')[0]
          );
          if (latestUserInfo) {
            signatureValidationPubliKey = latestUserInfo.publicKey!;
          }
        } else {
          signatureValidationPubliKey = currentChat.publicKey;
        }
      }
      savedMsg = (await decryptAndVerifyMessage(
        savedMsg,
        signatureValidationPubliKey,
        connectedUser.privateKey
      )) as IMessageIPFSWithCID;
    }
  }
  return savedMsg;
};

export const getEncryptedRequest = async (
  receiverAddress: string,
  senderCreatedUser: IConnectedUser,
  message: string,
  isGroup: boolean,
  env: ENV,
  group: GroupDTO | null,
  secretKey: string
): Promise<IEncryptedRequest> => {
  if (!isGroup) {
    const receiverCreatedUser: IUser = await get({
      account: receiverAddress,
      env,
    });
    if (!receiverCreatedUser?.publicKey) {
      if (!isValidETHAddress(receiverAddress)) {
        throw new Error(`Invalid receiver address!`);
      }
      await createUserService({
        user: receiverAddress,
        publicKey: '',
        encryptedPrivateKey: '',
        env,
      });
      // If the user is being created here, that means that user don't have a PGP keys. So this intent will be in plaintext

      const { signature } = await signMessageWithPGP({
        message: message,
        privateKeyArmored: senderCreatedUser.privateKey!,
      });

      return {
        message: message,
        encryptionType: 'PlainText',
        aesEncryptedSecret: '',
        signature: signature,
      };
    } else {
      // It's possible for a user to be created but the PGP keys still not created

      if (
        !receiverCreatedUser.publicKey.includes(
          '-----BEGIN PGP PUBLIC KEY BLOCK-----'
        )
      ) {
        const { signature } = await signMessageWithPGP({
          message: message,
          privateKeyArmored: senderCreatedUser.privateKey!,
        });

        return {
          message: message,
          encryptionType: 'PlainText',
          aesEncryptedSecret: '',
          signature: signature,
        };
      } else {
        const { cipherText, encryptedSecret, signature } = await encryptAndSign(
          {
            plainText: message,
            keys: [receiverCreatedUser.publicKey, senderCreatedUser.publicKey],
            privateKeyArmored: senderCreatedUser.privateKey!,
            secretKey,
          }
        );
        return {
          message: cipherText,
          encryptionType: 'pgp',
          aesEncryptedSecret: encryptedSecret,
          signature: signature,
        };
      }
    }
  } else if (group) {
    if (group.isPublic) {
      const { signature } = await signMessageWithPGP({
        message: message,
        privateKeyArmored: senderCreatedUser.privateKey!,
      });
      return {
        message: message,
        encryptionType: 'PlainText',
        aesEncryptedSecret: '',
        signature: signature,
      };
    } else {
      const publicKeys: string[] = group.members.map(
        (member) => member.publicKey
      );
      const { cipherText, encryptedSecret, signature } = await encryptAndSign({
        plainText: message,
        keys: publicKeys,
        privateKeyArmored: senderCreatedUser.privateKey!,
        secretKey,
      });
      return {
        message: cipherText,
        encryptionType: 'pgp',
        aesEncryptedSecret: encryptedSecret,
        signature: signature,
      };
    }
  } else {
    throw new Error('Unable to find Group Data');
  }
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
  const signature = await _signer?.signMessage(message);
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
  let chainId: number;
  try {
    chainId = await _signer.getChainId();
  } catch (err) {
    chainId = 1;
  }
  const domain = getDomainInformation(chainId);

  // sign a message using EIP712
  const signedMessage = await _signer?._signTypedData!(
    isDomainEmpty ? {} : domain,
    typeInformation,
    { data: hash }
  );
  const verificationProof = isDomainEmpty
    ? `${SIG_TYPE_V2}:${signedMessage}`
    : `${SIG_TYPE_V2}:${chainId}:${signedMessage}`;
  return { verificationProof };
};

export async function getDecryptedPrivateKey(
  wallet: walletType,
  user: any,
  address: string
): Promise<string> {
  let decryptedPrivateKey;
  if (wallet.signer) {
    decryptedPrivateKey = await decryptPGPKey({
      signer: wallet.signer,
      encryptedPGPPrivateKey: user.encryptedPrivateKey,
    });
  } else {
    decryptedPrivateKey = await decryptWithWalletRPCMethod(
      user.encryptedPrivateKey,
      address
    );
  }
  return decryptedPrivateKey;
}

/**
 * Decrypts and verifies a Push Chat Message
 * @param message encrypted chat message
 * @param pgpPublicKey pgp public key of signer of message - used for verification
 * @param pgpPrivateKey pgp private key of receiver - used for decryption
 */
export const decryptAndVerifyMessage = async (
  message: IMessageIPFS | IMessageIPFSWithCID,
  pgpPublicKey: string,
  pgpPrivateKey: string
): Promise<IMessageIPFS | IMessageIPFSWithCID> => {
  /**
   * VERIFICATION
   * If verification proof is present then check that else check messageContent Signature
   */
  if (
    message.verificationProof &&
    message.verificationProof.split(':')[0] === 'pgpv2'
  ) {
    const bodyToBeHashed = {
      fromDID: message.fromDID,
      toDID: message.fromDID,
      fromCAIP10: message.fromCAIP10,
      toCAIP10: message.toCAIP10,
      messageObj: message.messageObj,
      messageType: message.messageType,
      encType: message.encType,
      encryptedSecret: message.encryptedSecret,
    };
    const hash = CryptoJS.SHA256(JSON.stringify(bodyToBeHashed)).toString();
    const signature = message.verificationProof.split(':')[1];
    await verifySignature({
      messageContent: hash,
      signatureArmored: signature,
      publicKeyArmored: pgpPublicKey,
    });
  } else {
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
          signatureArmored: message.signature,
          publicKeyArmored: pgpPublicKey,
        });
      } catch (err) {
        await verifySignature({
          messageContent: message.messageContent,
          signatureArmored: message.signature,
          publicKeyArmored: pgpPublicKey,
        });
      }
    } else {
      await verifySignature({
        messageContent: message.messageContent,
        signatureArmored: message.signature,
        publicKeyArmored: pgpPublicKey,
      });
    }
  }

  /**
   * DECRYPTION
   * 1. Decrypt AES Key
   * 2. Decrypt messageObj.message, messageObj.meta , messageContent
   */
  const secretKey: string = await pgpDecrypt({
    cipherText: message.encryptedSecret,
    toPrivateKeyArmored: pgpPrivateKey,
  });
  message.messageContent = aesDecrypt({
    cipherText: message.messageContent,
    secretKey,
  });
  if (message.messageObj) {
    message.messageObj = JSON.parse(
      aesDecrypt({
        cipherText: message.messageObj as string,
        secretKey,
      })
    );
  }
  return message;
};
