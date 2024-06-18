import CONFIG, { ConfigType } from '../config';
import { ENV } from '../constants';
import { PushValidator } from '../pushValidator/pushValidator';

/**
 * This config helper returns the EPNS communicator contract method address
 */
export const getConfig = (
  env: ENV,
  {
    blockchain,
    networkId,
  }: {
    blockchain: string;
    networkId: string;
  }
): ConfigType => {
  const blockchainSelector = `${blockchain}:${networkId}`;
  const configuration = CONFIG[env][blockchainSelector];

  if (!configuration) {
    throw Error(`
      [Push SDK] - cannot determine config for 
        env: ${env},
        blockchain: ${blockchain},
        networkId: ${networkId}
    `);
  }

  return configuration;
};

/**
 * This config helper returns only the API urls
 */
export async function getAPIBaseUrls(env: ENV) {
  if (!env) throw Error('ENV not provided!');
  const pushValidator = await PushValidator.initalize({ env });
  return `${pushValidator.activeValidatorURL}/apis`;
}
