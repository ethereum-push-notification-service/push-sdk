import { ENV } from '../constants';
import { AliasInfoOptions, AliasOptions } from './PushNotificationTypes';
import { SignerType } from '../types';
import { validateCAIP } from '../helpers';
import CONFIG, * as config from '../config';
import * as PUSH_ALIAS from '../alias';
import { PushNotificationBaseClass } from './pushNotificationBase';


export class Alias extends PushNotificationBaseClass {
  constructor(signer?: SignerType, env?: ENV, account?: string) {
    super(signer, env, account);
  }

  /**
   * @description - fetches alias information
   * @param {AliasOptions} options - options related to alias
   * @returns Alias details
   */
  info = async (options: AliasOptions) => {
    try {
      return await PUSH_ALIAS.getAliasInfo({ ...options, env: this.env });
    } catch (error) {
      throw new Error(`Push SDK Error: API : alias::info : ${error}`);
    }
  };

  /**
   * @description adds an alias to the channel
   * @param {string} alias - alias address in caip to be added
   * @param {AliasInfoOptions} options - options related to alias
   * @returns the transaction hash if the transaction is successfull
   */
  initiate = async (alias: string, options?: AliasInfoOptions): Promise<any> => {
    try {
      this.checkSignerObjectExists();
      const networkDetails = await this.getChainId(this.signer!);
      const caip = `eip155:${networkDetails}`;
      if (!CONFIG[this.env!][caip] || !config.VIEM_CONFIG[this.env!][caip]) {
        throw new Error('Unsupported Chainid');
      }
      const commAddress = CONFIG[this.env!][caip].EPNS_COMMUNICATOR_CONTRACT;

      const commContract = this.createContractInstance(
        commAddress,
        config.ABIS.COMM,
        config.VIEM_CONFIG[this.env!][caip].NETWORK
      );

      const addAliasRes = await this.initiateAddAlias(commContract, alias);
      let resp: { [key: string]: any } = { tx: addAliasRes }
      if (options?.raw) {
          resp = {
            ...resp,
            "raw": {
              "initiateVerificationProof": addAliasRes
            }
          }
      }
      return resp;
    } catch (error) {
      throw new Error(`Push SDK Error: Contract : alias::add : ${error}`);
    }
  };

  /**
  * @description verifies an alias address of a channel
  * @param {string} channelAddress - channelAddress to be verified
  * @param {AliasInfoOptions} options - options related to alias
  * @returns the transaction hash if the transaction is successfull
  */
  verify = async (channelAddress: string, options?: AliasInfoOptions) => {
    try {
      this.checkSignerObjectExists();
      const networkDetails = await this.getChainId(this.signer!);
      const caip = `eip155:${networkDetails}`;

      if (!CONFIG[this.env!][caip] || !config.VIEM_CONFIG[this.env!][caip]) {
        throw new Error('Unsupported Chainid');
      }
      const commAddress = CONFIG[this.env!][caip].EPNS_COMMUNICATOR_CONTRACT;

      const commContract = this.createContractInstance(
        commAddress,
        config.ABIS.COMM,
        config.VIEM_CONFIG[this.env!][caip].NETWORK
      );
      const { verifyAliasRes, channelInfo } = await this.verifyAlias(commContract, channelAddress);
      let resp: { [key: string]: any } = { tx: verifyAliasRes }
      if (options?.raw) {
          resp = {
            ...resp,
            "raw": {
              "initiateVerificationProof": channelInfo.initiate_verification_proof,
              "verifyVerificationProof": verifyAliasRes
            }
          }
      }
      return resp;
    } catch (error) {
      throw new Error(`Push SDK Error: Contract : alias::verify : ${error}`);
    }
  };
}
