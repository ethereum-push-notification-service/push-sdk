import { ApiSubscriptionType, NotificationSettingType } from '../types';
import { parseSettings } from './parseSettings';
/**
 * @description parse the response gotten from the API
 * @param {ApiSubscriptionType[]} response
 * @returns {SubscriptionResponse[]}
 */

export type SubscriptionResponse = {
    channel: string,
    user_settings: NotificationSettingType[] | null
}
export function parseSubscriptionsApiResponse(response: ApiSubscriptionType[]):SubscriptionResponse[]  {
  return response.map((apisubscription: ApiSubscriptionType) => {
    return {
        channel: apisubscription.channel,
        user_settings: apisubscription.user_settings? parseSettings(apisubscription.user_settings): null
    }
  });
}