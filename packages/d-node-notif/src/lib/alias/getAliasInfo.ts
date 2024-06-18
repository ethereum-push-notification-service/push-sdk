import { getAPIBaseUrls, getCAIPWithChainId } from '../helpers';
import Constants, { ENV } from '../constants';
import { ALIAS_CHAIN, ALIAS_CHAIN_ID } from '../config';
import { axiosGet } from '../utils/axiosUtil';

/**
 *  GET /v1/alias/{aliasAddressinCAIP}/channel
 */

export type GetAliasInfoOptionsType = {
  /** alias address of the ethereum channel */
  alias: string;
  /** name of the alias chain, can be Polygon or BSC or Optimism */
  aliasChain: ALIAS_CHAIN;
  env?: ENV;
};

/**
 *  Returns the ethereum channel address of the provided alias address along with its verification status
 */

export const getAliasInfo = async (options: GetAliasInfoOptionsType) => {
  const { alias, aliasChain, env = Constants.ENV.PROD } = options || {};

  const aliasChainId: number = ALIAS_CHAIN_ID[aliasChain][env];

  const _alias = getCAIPWithChainId(alias, aliasChainId, 'Alias');
  const API_BASE_URL = await getAPIBaseUrls(env);
  const apiEndpoint = `${API_BASE_URL}/v1/alias`;
  const requestUrl = `${apiEndpoint}/${_alias}/channel`;

  return await axiosGet(requestUrl)
    .then((response) => response.data)
    .catch((err) => {
      console.error(`[EPNS-SDK] - API ${requestUrl}: `, err);
    });
};
