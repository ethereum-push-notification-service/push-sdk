import { ApiNotificationType } from '../types';
import { decryptViaPGP, aesDecryption } from '../payloads/encHelpers';
import { SUPPORTED_ENC_TYPE } from '../payloads/constants';
import { Lit } from '../payloads/litHelper';

export async function decryptFeed(options: {
  feed: ApiNotificationType;
  pgpPrivateKey?: string;
  lit?: any;
}): Promise<ApiNotificationType> {
  // do case wise decryption
  const { feed, pgpPrivateKey, lit } = options || {};
  const [prefix, ...secret] = feed.payload.data.secret.toString().split(':');
  if (prefix == SUPPORTED_ENC_TYPE.PGPV1) {
    return await decryptFeedViaPGP({
      encryptedFeed: feed,
      pgpPrivateKey: pgpPrivateKey as string,
      encryptedSecret: secret.join()
    });
  }
  if (prefix == SUPPORTED_ENC_TYPE.LITV1) {
    return await decryptFeedViaLIT({
      encryptedFeed: feed,
      lit: lit,
      encryptedSecret: secret.join(':')
    });
  }
  return feed;
}

export async function decryptFeedViaPGP(options: {
  encryptedFeed: ApiNotificationType;
  pgpPrivateKey: string;
  encryptedSecret: string;
}) {
  const { encryptedFeed, pgpPrivateKey, encryptedSecret } = options || {};
  if (!pgpPrivateKey) {
    return encryptedFeed;
  }
  const secret = await decryptViaPGP({
    cipherText: encryptedSecret,
    pgpPrivateKey: pgpPrivateKey
  });
  const decryptedFeed = decryptFeedViaAES({ encryptedFeed, secret });
  return decryptedFeed;
}

export async function decryptFeedViaLIT(options: {
  encryptedFeed: ApiNotificationType;
  lit: Lit;
  encryptedSecret: string;
}) {
  try {
    const { encryptedFeed, lit, encryptedSecret } = options || {};
    if (!lit) {
      return encryptedFeed;
    }
    const encryptedSecretObject: {
      ciphertext: string;
      dataToEncryptHash: string;
    } = JSON.parse(encryptedSecret);
    const secret = await lit.decrypt({ ...encryptedSecretObject });
    console.log(secret)
    const decryptedFeed = decryptFeedViaAES({
      encryptedFeed,
      secret: secret as string
    });
    return decryptedFeed;
  } catch (error) {
    return options.encryptedFeed;
  }
}

export function decryptFeedViaAES(options: {
  encryptedFeed: ApiNotificationType;
  secret: string;
}) {
  const { encryptedFeed, secret } = options || {};
  if (!secret) {
    return encryptedFeed;
  }
  try {
    const decryptedFeed: ApiNotificationType = {
      ...encryptedFeed,
      payload: {
        ...encryptedFeed.payload,
        notification: {
          title: encryptedFeed.payload.notification.title
          ,
          body: aesDecryption({
            encryptedMessage: encryptedFeed.payload.notification.body,
            secret
          })
        },
        data: {
          ...encryptedFeed.payload.data,
          acta: encryptedFeed.payload.data.acta
            ? aesDecryption({
                encryptedMessage: encryptedFeed.payload.data.acta,
                secret
              })
            : '',
          asub: encryptedFeed.payload.data.asub
            ? aesDecryption({
                encryptedMessage: encryptedFeed.payload.data.asub,
                secret
              })
            : '',
          icon: encryptedFeed.payload.data.icon,
          url: encryptedFeed.payload.data.url,
          sid: encryptedFeed.payload.data.sid,
          app: encryptedFeed.payload.data.app,
          amsg: encryptedFeed.payload.data.amsg
            ? aesDecryption({
                encryptedMessage: encryptedFeed.payload.data.amsg,
                secret
              })
            : '',
          aimg: encryptedFeed.payload.data.aimg
            ? aesDecryption({
                encryptedMessage: encryptedFeed.payload.data.aimg,
                secret
              })
            : '',
          secret: ''
        }
      }
    };
    return decryptedFeed;
  } catch (error) {
    return encryptedFeed;
  }
}
