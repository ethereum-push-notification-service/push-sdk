import axios from 'axios';
import { getRandomElement } from '../helpers';
import {
  ActiveValidator,
  PingReply,
  TokenReply,
  ValidatorContract,
} from './pushValidatorTypes';
import { axiosGet } from '../utils/axiosUtil';
import { createPublicClient, getContract, http } from 'viem';
import * as config from '../config';
import { ENV } from '../constants';

/**
 * @description Push validator class is used for the following:
 * - Interact with validator.sol ( Only Read calls )
 * - Get token to interact with a random validator node
 * - Ping a random validator node to check if it is alive
 */
export class PushValidator {
  private static instance: PushValidator;
  private validatorContractClient: ValidatorContract;
  /**
   * @dev - active validator URL ( Used for Get calls to a validator node )
   */
  public activeValidatorURL: string;
  public env: ENV;

  private constructor(
    activeValidatorURL: string,
    env: ENV,
    validatorContractClient: ValidatorContract
  ) {
    this.activeValidatorURL = activeValidatorURL;
    this.env = env;
    this.validatorContractClient = validatorContractClient;
  }

  static initalize = async (options?: { env: ENV }): Promise<PushValidator> => {
    const settings = options || { env: ENV.STAGING };

    /**
     * @dev - If instance is not created or env is different, create a new instance
     */
    if (
      !PushValidator.instance ||
      PushValidator.instance.env !== settings.env
    ) {
      const validatorContractClient =
        PushValidator.createValidatorContractClient(settings.env);
      const activeValidator = await PushValidator.getActiveValidator(
        validatorContractClient
      );
      PushValidator.instance = new PushValidator(
        activeValidator.nodeApiBaseUrl,
        settings.env,
        validatorContractClient
      );
    }
    return PushValidator.instance;
  };

  /**
   * @description Get validator node token
   * @returns Token reply object with API token and validator URL
   */
  getToken = async (): Promise<TokenReply | null> => {
    const activeValidator = await PushValidator.getActiveValidator(
      this.validatorContractClient
    );
    const requestUrl = `${activeValidator.nodeApiBaseUrl}/apis/v1/messaging/validatorToken`;
    return await axiosGet(requestUrl)
      .then((response) => {
        if (response.status != 200) {
          throw new Error(
            `error status: ${response.status} data: ${response.data}`
          );
        }
        return response.data;
      })
      .catch((err) => {
        console.error(`[Push SDK] - API ${requestUrl}: `, err);
        return null;
      });
  };

  /**
   * @description Ping validator
   * @param validatorUrl - Validator URL to ping (default is active validator URL)
   * @returns Ping reply object
   */
  ping = async (
    validatorUrl: string = this.activeValidatorURL
  ): Promise<PingReply | null> => {
    const requestUrl = `${validatorUrl}/apis/v1/messaging/ping`;
    return await axiosGet(requestUrl)
      .then((response) => {
        if (response.status != 200) {
          throw new Error(
            `error status: ${response.status} data: ${response.data}`
          );
        }
        return response.data;
      })
      .catch((err) => {
        console.error(`[Push SDK] - API ${requestUrl}: `, err);
        return null;
      });
  };

  /**
   * @description Get active validator
   * @returns Active validator object
   */
  private static getActiveValidator = async (
    validatorContractClient: ValidatorContract
  ): Promise<ActiveValidator> => {
    const activeValidators =
      await validatorContractClient.read.getActiveVNodes();
    return getRandomElement(activeValidators);
  };

  /**
   * @description Create validator contract client
   * @param env - Environment
   * @dev - Currently only supports public client
   * @returns Validator contract client
   */
  private static createValidatorContractClient = (
    env: ENV
  ): ValidatorContract => {
    const client = createPublicClient({
      chain: config.VALIDATOR_CONFIG[env].NETWORK,
      transport: http(),
    });
    return getContract({
      abi: config.ABIS.VALIDATOR,
      address: config.VALIDATOR_CONFIG[env].VALIDATOR_CONTRACT as `0x${string}`,
      client: {
        public: client,
      },
    }) as any;
  };
}
