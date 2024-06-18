import { ENV } from '../constants';
import CONSTANTS from '../constants';

import { getAPIBaseUrls, getCAIPAddress } from '../helpers';
import { axiosGet } from '../utils/axiosUtil';
import { parseSettings } from '../utils/parseSettings';

/**
 *  GET /v1/channels/{addressinCAIP}
 */

type getChannelsOptionsType = {
  env?: ENV;

  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
};

export const getChannels = async (options: getChannelsOptionsType) => {
  const {
    env = CONSTANTS.ENV.PROD,
    page = 1,
    limit = 10,
    sort = CONSTANTS.FILTER.CHANNEL_LIST.SORT.SUBSCRIBER,
    order = CONSTANTS.FILTER.CHANNEL_LIST.ORDER.DESCENDING,
  } = options || {};

  const API_BASE_URL = await getAPIBaseUrls(env);
  const apiEndpoint = `${API_BASE_URL}/v1/channels`;
  const requestUrl = `${apiEndpoint}?page=${page}&limit=${limit}&sort=${sort}&order=${order}`;

  return await axiosGet(requestUrl)
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      console.error(`[Push SDK] - API ${requestUrl}: `, err);
      throw Error(`[Push SDK] - API  - Error - API ${requestUrl} -: ${err}`);
    });
};
