import { ApiNotificationType, ParsedResponseType } from '../types';
import { decryptFeed } from './decryptFeed';

/**
 * @description parse the response gotten from the API
 * @param {ApiNotificationType[]} response
 * @returns {ParsedResponseType[]}
 */

/**
 * @description parse the response gotten from the API
 * @param {ApiNotificationType[]} response
 * @returns {Promise<ParsedResponseType[]>}
 */
export async function parseApiResponse(response: ApiNotificationType[], pgpPrivateKey?: string, lit?: any): Promise<ParsedResponseType[]> {
  const parsedResults = await Promise.all(response.map(async (apiNotification: ApiNotificationType) => {
    if (apiNotification.payload.data.secret) {
      apiNotification = await decryptFeed({ feed: apiNotification, pgpPrivateKey, lit });
    }
    const {
      payload: {
        data: {
          acta: cta = "",
          amsg: bigMessage = "",
          asub = "",
          icon = "",
          url = "",
          sid = "",
          app = "",
          aimg = "",
          secret = ""
        },
        notification,
      },
      source,
    } = apiNotification;
    return {
      cta,
      title: asub || '',
      message: bigMessage || notification.body || '',
      icon,
      url,
      sid,
      app,
      image: aimg,
      blockchain: source,
      notification,
      secret
    };
  }));

  return parsedResults;
}
