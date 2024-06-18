import { ApiSubscribersType, NotificationSettingType } from '../types';
import { parseSettings } from './parseSettings';
/**
 * @description parse the response gotten from the API
 * @param {ApiSubscribersType[]} response
 * @returns {NotificationSettingType[]}
 */

export type SubscriberResponse = {
  itemcount: number;
  subscribers: {subscriber: string, settings: NotificationSettingType[] | null}[]
}
export function parseSubscrbersApiResponse(response: ApiSubscribersType):SubscriberResponse  {
  const parsedSubscribers = response.subscribers.map((apisubscribers: {subscriber: string, settings: string| null}) => {
    return {
        subscriber: apisubscribers.subscriber,
        settings: apisubscribers.settings? parseSettings(apisubscribers.settings): null
    }
  });
  return {
    itemcount: response.itemcount,
    subscribers: [...parsedSubscribers]
  }
}