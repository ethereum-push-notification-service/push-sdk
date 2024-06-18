import { getCAIPAddress, getAPIBaseUrls } from '../helpers';
import Constants, { ENV } from '../constants';
import { Subscribers } from '../types';
import { axiosGet } from '../utils/axiosUtil';
import { parseSubscrbersApiResponse } from '../utils/parseSubscribersAPI';

/**
 *  GET /v1/channels/:channelId/:subscribers
 */

export type GetChannelSubscribersOptionsType = {
  channel: string; // plain ETH Format only
  page?: number;
  limit?: number;
  category?: number;
  setting?: boolean;
  env?: ENV;
  raw?: boolean;
};

export const getSubscribers = async (
  options: GetChannelSubscribersOptionsType
): Promise<Subscribers> => {
  try {
    const {
      channel,
      page = 1,
      limit = 10,
      category = null,
      setting = false,
      env = Constants.ENV.PROD,
      raw = true,
    } = options || {};

    try {
      if (channel == null || channel.length == 0) {
        throw new Error(`channel cannot be null or empty`);
      }

      if (page <= 0) {
        throw new Error('page must be greater than 0');
      }

      if (limit <= 0) {
        throw new Error('limit must be greater than 0');
      }

      if (limit > 30) {
        throw new Error('limit must be lesser than or equal to 30');
      }
      const _channel = await getCAIPAddress(env, channel, 'Channel');
      const API_BASE_URL = await getAPIBaseUrls(env);
      let apiEndpoint = `${API_BASE_URL}/v1/channels/${_channel}/subscribers?page=${page}&limit=${limit}&setting=${setting}`;
      if (category) {
        apiEndpoint = apiEndpoint + `&category=${category}`;
      }
      return await axiosGet(apiEndpoint)
        .then((response) => {
          if (raw) return response.data;
          else return parseSubscrbersApiResponse(response.data);
        })
        .catch((err) => {
          console.error(`[Push SDK] - API ${apiEndpoint}: `, err);
        });
    } catch (err) {
      console.error(`[Push SDK] - API  - Error - API send() -:  `, err);
      throw Error(`[Push SDK] - API  - Error - API send() -: ${err}`);
    }
  } catch (err) {
    console.error(`[Push SDK] - API  - Error - API send() -:  `, err);
    throw Error(`[Push SDK] - API  - Error - API send() -: ${err}`);
  }
};
