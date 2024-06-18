import { ENV } from '../constants';
import { SignerType } from '../types';
import { ChannelInfoOptions } from './PushNotificationTypes';
import CONFIG, * as config from '../config';
import * as PUSH_CHANNEL from '../channels';
import { validateCAIP, getFallbackETHCAIPAddress } from '../helpers';
import { PushNotificationBaseClass } from './pushNotificationBase';

export class Delegate extends PushNotificationBaseClass {
  constructor(signer?: SignerType, env?: ENV, account?: string) {
    super(signer, env, account);
  }

  /**
   * @description - Get delegates of a channell
   * @param {string} [options.channel] - channel in caip. defaults to account from signer with eth caip
   * @returns array of delegates
   */
  get = async (options?: ChannelInfoOptions) => {
    try {
      // const {
      //   channel = this.account
      //     ? getFallbackETHCAIPAddress(this.env!, this.account!)
      //     : null,
      // } = options || {};
      let channel = options?.channel
        ? options.channel
        : this.account
        ? getFallbackETHCAIPAddress(this.env!, this.account!)
        : null;
      this.checkUserAddressExists(channel!);
      channel = validateCAIP(channel!)
        ? channel
        : getFallbackETHCAIPAddress(this.env!, channel!);
      this.checkUserAddressExists(channel!);
      return await PUSH_CHANNEL.getDelegates({
        channel: channel!,
        env: this.env,
      });
    } catch (error) {
      throw new Error(`Push SDK Error: API : delegate::get : ${error}`);
    }
  };

  /**
   * @description adds a delegate
   * @param {string} delegate - delegate address in caip to be added
   * @returns the transaction hash if the transaction is successfull
   */
  add = async (delegate: string) => {
    try {
      this.checkSignerObjectExists();
      if (validateCAIP(delegate)) {
        delegate = this.getAddressFromCaip(delegate);
      }
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
      const addDelegateRes = await this.addDelegator(commContract, delegate);
      return { transactionHash: addDelegateRes };
    } catch (error) {
      throw new Error(`Push SDK Error: Contract : delegate::add : ${error}`);
    }
  };

  /**
   * @description removes a delegate
   * @param {string} delegate - caip address of the delegate to be removed
   * @returns the transaction hash if the transaction is successfull
   */
  remove = async (delegate: string) => {
    try {
      this.checkSignerObjectExists();
      if (validateCAIP(delegate)) {
        delegate = this.getAddressFromCaip(delegate);
      }
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
      const removeDelegateRes = await this.removeDelegator(
        commContract,
        delegate
      );
      return { transactionHash: removeDelegateRes };
    } catch (error) {
      throw new Error(`Push SDK Error: Contract : delegate::remove : ${error}`);
    }
  };
}
