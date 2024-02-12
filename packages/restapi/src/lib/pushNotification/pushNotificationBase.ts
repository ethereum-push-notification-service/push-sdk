import { ENV } from '../constants';
import { SignerType, ISendNotificationInputOptions } from '../types';
import {
  NotificationOptions,
  CreateChannelOptions,
  NotificationSettings,
  UserSetting,
} from './PushNotificationTypes';
import * as config from '../config';
import { getAccountAddress } from '../chat/helpers';
import { IDENTITY_TYPE, NOTIFICATION_TYPE } from '../payloads/constants';
import { ethers, Signer as EthersSigner } from 'ethers';
import {
  createPublicClient,
  http,
  getContract,
  WalletClient,
  Chain,
  toHex,
} from 'viem';
import * as PUSH_CHANNEL from '../channels';
import {
  Signer,
  getAPIBaseUrls,
  getFallbackETHCAIPAddress,
  validateCAIP,
} from '../helpers';
import { axiosGet, axiosPost } from '../utils/axiosUtil';
import { PushAPI } from '../pushapi/PushAPI';
import { Lit } from '../payloads/litHelper';

// ERROR CONSTANTS
const ERROR_ACCOUNT_NEEDED = 'Account is required';
const ERROR_SIGNER_NEEDED = 'Signer object is required';

const BROADCAST_TYPE = '*';
const LENGTH_UPPER_LIMIT = 125;
const LENGTH_LOWER_LIMTI = 1;
const SETTING_DELIMITER = '-';
const SETTING_SEPARATOR = '+';
const RANGE_TYPE = 3;
const SLIDER_TYPE = 2;
const BOOLEAN_TYPE = 1;
const DEFAULT_ENABLE_VALUE = '1';
const DEFAULT_TICKER_VALUE = '1';

export const FEED_MAP = {
  INBOX: false,
  SPAM: true,
};
export class PushNotificationBaseClass {
  protected signer: SignerType | undefined;
  protected account: string | undefined;
  protected env: ENV | undefined;
  protected guestMode: boolean;
  protected coreContract: any;

  constructor(signer?: SignerType, env?: ENV, account?: string) {
    this.signer = signer;
    this.env = env;
    this.guestMode = !!(account && signer);
    this.account = account;
    this.initializeCoreContract({ signer: this.signer, env: this.env });
  }

  private async initializeCoreContract(options?: {
    signer?: SignerType;
    env?: ENV;
  }) {
    const { env = ENV.STAGING, signer = null } = options || {};
    // Derives account from signer if not provided
    let derivedAccount;
    let coreContract;
    if (signer) {
      derivedAccount = await getAccountAddress({
        account: null,
        signer: signer,
      });
      const pushSigner = new Signer(signer);
      if (pushSigner.isViemSigner(signer)) {
        const client = createPublicClient({
          chain: config.TOKEN_VIEM_NETWORK_MAP[env],
          transport: http(),
        });
        coreContract = getContract({
          abi: config.ABIS.CORE,
          address: config.CORE_CONFIG[env].EPNS_CORE_CONTRACT as `0x${string}`,
          publicClient: client,
          walletClient: signer as unknown as WalletClient,
        });
      } else {
        coreContract = new ethers.Contract(
          config.CORE_CONFIG[env].EPNS_CORE_CONTRACT,
          config.ABIS.CORE,
          signer as unknown as EthersSigner
        );
      }
    }

    // Initialize PushNotifications instance
    this.coreContract = coreContract;
  }

  // check if addresses is supplied either by user or derived from signer object or if its guest mode
  protected checkUserAddressExists(user?: string) {
    if (!user && !this.account && !this.guestMode)
      throw new Error(ERROR_ACCOUNT_NEEDED);
    return true;
  }

  // checks if the signer object is supplied
  protected checkSignerObjectExists() {
    if (!this.signer) throw new Error(PushAPI.ensureSignerMessage());
    return true;
  }

  // get type of notification from recipient
  protected getNotificationType(
    recipient: string[],
    channel: string
  ): { recipient: string[] | string; type: number } {
    if (recipient.length == 1) {
      if (recipient[0] == BROADCAST_TYPE) {
        return { recipient: channel, type: NOTIFICATION_TYPE['BROADCAST'] };
      } else {
        return {
          recipient: recipient[0],
          type: NOTIFICATION_TYPE['TARGETTED'],
        };
      }
    }
    return { recipient, type: NOTIFICATION_TYPE['SUBSET'] };
  }

  // get identity type for lowlevel call
  protected generateNotificationLowLevelPayload({
    signer,
    env,
    recipients,
    options,
    channel,
    settings,
    secret,
    pgpPrivateKey,
    lit,
  }: {
    signer: SignerType;
    env: ENV;
    recipients: string[];
    options: NotificationOptions;
    channel?: string;
    settings: any | null;
    secret?: 'PGPV1' | 'LITV1',
    pgpPrivateKey?: string,
    lit?: Lit
  }): ISendNotificationInputOptions {
    if (!channel) {
      channel = `${this.account}`;
    }
    const notificationType = this.getNotificationType(recipients, channel);
    const identityType = IDENTITY_TYPE.DIRECT_PAYLOAD;
    // fetch the minimal version based on conifg that was passed
    let index = '';
    if (options.payload?.category && settings) {
      if (settings[options.payload.category - 1].type == SLIDER_TYPE) {
        index =
          options.payload.category +
          SETTING_DELIMITER +
          SLIDER_TYPE +
          SETTING_DELIMITER +
          settings[options.payload.category - 1].default;
      }
      if (settings[options.payload.category - 1].type == BOOLEAN_TYPE) {
        index = options.payload.category + SETTING_DELIMITER + BOOLEAN_TYPE;
      }
      if (settings[options.payload.category - 1].type == RANGE_TYPE) {
        index =
          options.payload.category +
          SETTING_DELIMITER +
          RANGE_TYPE +
          SETTING_DELIMITER +
          settings[options.payload.category - 1].default.lower;
      }
    }
    const notificationPayload: ISendNotificationInputOptions = {
      signer: signer,
      channel: channel,
      type: notificationType.type,
      identityType: identityType,
      notification: options.notification,
      payload: {
        title: options.payload?.title ?? options.notification.title,
        body: options.payload?.body ?? options.notification.body,
        cta: options.payload?.cta ?? '',
        img: options.payload?.embed ?? '',
        hidden: options.config?.hidden,
        etime: options.config?.expiry,
        silent: options.config?.silent,
        additionalMeta: options.payload?.meta,
        index: options.payload?.category ? index : '',
        sectype: secret?? null
      },
      recipients: notificationType.recipient,
      graph: options.advanced?.graph,
      ipfsHash: options.advanced?.ipfs,
      env: env,
      chatId: options.advanced?.chatid,
      pgpPrivateKey: options.advanced?.pgpPrivateKey?? pgpPrivateKey,
      lit: lit
    };
    return notificationPayload;
  }

  // check if the fields are empty
  protected isEmpty(field: string) {
    if (field.trim().length == 0) {
      return true;
    }

    return false;
  }

  // check if the length is valid
  protected isValidLength(
    data: string,
    upperLen: number = LENGTH_UPPER_LIMIT,
    lowerLen: number = LENGTH_LOWER_LIMTI
  ): boolean {
    return data.length >= lowerLen && data.length <= upperLen!;
  }

  // check if url is valid
  protected isValidUrl(urlString: string): boolean {
    const urlPattern = new RegExp(
      '^((?:https|http):\\/\\/)' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
        '(\\#[-a-z\\d_]*)?$',
      'i'
    ); // validate fragment locator
    return !!urlPattern.test(urlString);
  }

  // check all the fields of channel
  protected verifyEmptyChannelParameters(
    options: CreateChannelOptions
  ): boolean {
    if (this.isEmpty(options.name)) {
      throw new Error('Channel name cannot be empty');
    } else if (this.isEmpty(options.description)) {
      throw new Error('Channel description cannot be empty');
    } else if (this.isEmpty(options.icon)) {
      throw new Error('Channel icon cannot be empty');
    } else if (this.isEmpty(options.url)) {
      throw new Error('Channel url cannot ne empty');
    } else {
      return true;
    }
  }

  // check for valid length and url
  protected validateParameterLength(options: CreateChannelOptions): boolean {
    if (!this.isValidLength(options.name)) {
      throw new Error(
        `Channel name should not exceed ${LENGTH_UPPER_LIMIT} characters`
      );
    } else if (!this.isValidLength(options.description)) {
      throw new Error(
        `Channel description should not exceed ${LENGTH_UPPER_LIMIT} characters`
      );
    } else if (
      !this.isValidLength(options.url) ||
      !this.isValidUrl(options.url)
    ) {
      throw new Error(
        `Channel url either excees ${LENGTH_UPPER_LIMIT} characters or is not a valid url`
      );
    } else {
      return true;
    }
  }

  protected validateChannelParameters(options: CreateChannelOptions): boolean {
    return (
      this.verifyEmptyChannelParameters(options) &&
      this.validateParameterLength(options)
    );
  }

  // create contract instance
  protected createContractInstance(
    contractAddress: string | `0x${string}`,
    contractABI: any,
    network: Chain
  ) {
    if (!this.signer) {
      throw new Error('Signer is not provided');
    }
    let contract: any;
    const pushSigner = this.signer ? new Signer(this.signer) : null;
    if (pushSigner?.isViemSigner(this.signer)) {
      const client = createPublicClient({
        chain: network,
        transport: http(),
      });
      contract = getContract({
        abi: contractABI,
        address: contractAddress as `0x${string}`,
        publicClient: client,
        walletClient: this.signer as unknown as WalletClient,
      });
    } else {
      contract = new ethers.Contract(
        contractAddress,
        contractABI,
        this.signer as unknown as EthersSigner
      );
    }
    return contract;
  }

  protected async fetchBalance(contract: any, userAddress: string) {
    if (!this.signer) {
      throw new Error('Signer is not provided');
    }
    let balance: bigint;
    const pushSigner = new Signer(this.signer);
    try {
      if (pushSigner.isViemSigner(this.signer)) {
        balance = BigInt(
          await contract.read.balanceOf({
            args: [userAddress],
          })
        );
      } else {
        balance = BigInt(await contract.balanceOf(userAddress));
      }
      return balance;
    } catch (err) {
      throw new Error(JSON.stringify(err));
    }
  }

  protected async fetchAllownace(
    contract: any,
    userAddress: string,
    spenderAddress: string
  ) {
    if (!this.signer) {
      throw new Error('Signer is not provided');
    }

    const pushSigner = new Signer(this.signer);
    let allowance: bigint;
    try {
      if (!pushSigner.isViemSigner(this.signer)) {
        allowance = BigInt(
          await contract!['allowance'](userAddress, spenderAddress)
        );
      } else {
        allowance = BigInt(
          await contract.read.allowance({
            args: [userAddress, spenderAddress],
          })
        );
      }
      return allowance;
    } catch (error) {
      throw new Error(JSON.stringify(error));
    }
  }

  protected async fetchUpdateCounter(contract: any, userAddress: string) {
    if (!this.signer) {
      throw new Error('Signer is not provided');
    }
    let count: bigint;
    const pushSigner = new Signer(this.signer);
    try {
      if (!pushSigner.isViemSigner(this.signer)) {
        count = BigInt(await contract!['channelUpdateCounter'](userAddress));
      } else {
        count = BigInt(
          await contract.read.channelUpdateCounter({
            args: [userAddress],
          })
        );
      }
      // add one and return the count
      return count + BigInt(1);
    } catch (error) {
      throw new Error(JSON.stringify(error));
    }
  }

  protected async approveToken(
    contract: any,
    spenderAddress: string,
    amount: string | bigint
  ) {
    try {
      if (!this.signer) {
        throw new Error('Signer is not provided');
      }
      const pushSigner = new Signer(this.signer);

      if (!pushSigner.isViemSigner(this.signer)) {
        if (!this.signer || !this.signer.provider) {
          throw new Error('ethers provider/signer is not provided');
        }
        const approvalTrxPromise = contract!['approve'](spenderAddress, amount);
        const approvalTrx = await approvalTrxPromise;
        await this.signer?.provider?.waitForTransaction(approvalTrx.hash);
      } else {
        if (!contract.write) {
          throw new Error('viem signer is not provided');
        }
        const approvalTrxPromise = contract.write.approve({
          args: [spenderAddress, amount],
        });
        const approvalTrxRes = await approvalTrxPromise;
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  protected async createChannel(
    contract: any,
    channelType: number,
    identityBytes: Uint8Array,
    fees: bigint
  ) {
    let createChannelRes;
    try {
      if (!this.signer) {
        throw new Error('Signer is not provided');
      }
      const pushSigner = new Signer(this.signer);
      if (!pushSigner.isViemSigner(this.signer)) {
        const createChannelPromise = contract!['createChannelWithPUSH'](
          channelType,
          identityBytes,
          fees,
          this.getTimeBound(),
          {
            gasLimit: 1000000,
          }
        );
        const createChannelTrx = await createChannelPromise;
        const createChannelTrxStatus =
          await this.signer?.provider?.waitForTransaction(
            createChannelTrx.hash
          );
        if (createChannelTrxStatus?.status == 0) {
          throw new Error('Something Went wrong while creating your channel');
        }
        createChannelRes = createChannelTrx.hash;
      } else {
        if (!contract.write) {
          throw new Error('viem signer is not provided');
        }
        const createChannelPromise = contract.write.createChannelWithPUSH({
          args: [channelType, toHex(new Uint8Array(identityBytes)), fees, this.getTimeBound()],
        });
        createChannelRes = await createChannelPromise;
      }
      return createChannelRes;
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  protected async updateChannel(
    contract: any,
    account: string,
    identityBytes: Uint8Array,
    fees: bigint
  ) {
    let updateChannelRes;
    try {
      if (!this.signer) {
        throw new Error('Signer is not provided');
      }
      const pushSigner = new Signer(this.signer);
      if (!pushSigner.isViemSigner(this.signer)) {
        const updateChannelPromise = contract!['updateChannelMeta'](
          account,
          identityBytes,
          fees,
          {
            gasLimit: 1000000,
          }
        );
        const updateChannelTrx = await updateChannelPromise;
        const updateChannelTrxStatus =
          await this.signer?.provider?.waitForTransaction(
            updateChannelTrx.hash
          );
        if (updateChannelTrxStatus?.status == 0) {
          throw new Error('Something Went wrong while updating your channel');
        }
        updateChannelRes = updateChannelTrx.hash;
      } else {
        if (!contract.write) {
          throw new Error('viem signer is not provided');
        }
        const updateChannelPromise = contract.write.updateChannelMeta({
          args: [account, toHex(new Uint8Array(identityBytes)), fees],
        });
        updateChannelRes = await updateChannelPromise;
      }

      return updateChannelRes;
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  protected async verifyChannel(contract: any, channelToBeVerified: string) {
    try {
      if (!this.signer) {
        throw new Error('Signer is not provided');
      }
      const pushSigner = new Signer(this.signer);
      let verifyTrxRes;
      if (!pushSigner.isViemSigner(this.signer)) {
        if (!this.signer.provider) {
          throw new Error('ethers provider is not provided');
        }
        const verifyTrxPromise = contract!['verify'](channelToBeVerified);
        const verifyTrx = await verifyTrxPromise;
        await this.signer?.provider?.waitForTransaction(verifyTrx.hash);
        verifyTrxRes = verifyTrx.hash;
      } else {
        if (!contract.write) {
          throw new Error('viem signer is not provided');
        }
        const verifyTrxPromise = contract.write.verify({
          args: [channelToBeVerified],
        });
        verifyTrxRes = await verifyTrxPromise;
      }
      return verifyTrxRes;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  protected async createChanelSettings(
    contract: any,
    numberOfSettings: number,
    settings: string,
    description: string,
    fees: bigint
  ) {
    try {
      if (!this.signer) {
        throw new Error('Signer is not provided');
      }
      const pushSigner = new Signer(this.signer);
      let createSettingsRes;
      if (!pushSigner.isViemSigner(this.signer)) {
        if (!this.signer.provider) {
          throw new Error('ethers provider is not provided');
        }
        const createSettingsPromise = contract!['createChannelSettings'](
          numberOfSettings,
          settings,
          description,
          fees
        );
        const createSettings = await createSettingsPromise;
        await this.signer?.provider?.waitForTransaction(createSettings.hash);
        createSettingsRes = createSettings.hash;
      } else {
        if (!contract.write) {
          throw new Error('viem signer is not provided');
        }
        const createSettingsTrxPromise = contract.write.createChannelSettings({
          args: [numberOfSettings, settings, description, fees],
        });
        createSettingsRes = await createSettingsTrxPromise;
      }
      return createSettingsRes;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  protected async addDelegator(contract: any, delegatee: string) {
    try {
      if (!this.signer) {
        throw new Error('Signer is not provided');
      }
      const pushSigner = new Signer(this.signer);
      let addDelegateRes;
      if (!pushSigner.isViemSigner(this.signer)) {
        if (!this.signer.provider) {
          throw new Error('ethers provider is not provided');
        }
        const addDelegateTrxPromise = contract!['addDelegate'](delegatee);
        const addDelegateTrx = await addDelegateTrxPromise;
        await this.signer?.provider?.waitForTransaction(addDelegateTrx.hash);
        addDelegateRes = addDelegateTrx.hash;
      } else {
        if (!contract.write) {
          throw new Error('viem signer is not provided');
        }
        const addDelegateTrxPromise = contract.write.addDelegate({
          args: [delegatee],
        });
        addDelegateRes = await addDelegateTrxPromise;
      }
      return addDelegateRes;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  protected async removeDelegator(contract: any, delegatee: string) {
    try {
      if (!this.signer) {
        throw new Error('Signer is not provided');
      }
      const pushSigner = new Signer(this.signer);
      let removeDelegateRes;
      if (!pushSigner.isViemSigner(this.signer)) {
        if (!this.signer.provider) {
          throw new Error('ethers provider is not provided');
        }
        const removeDelegateTrxPromise = contract!['removeDelegate'](delegatee);
        const removeDelegateTrx = await removeDelegateTrxPromise;
        await this.signer?.provider?.waitForTransaction(removeDelegateTrx.hash);
        removeDelegateRes = removeDelegateTrx.hash;
      } else {
        if (!contract.write) {
          throw new Error('viem signer is not provided');
        }
        const removeDelegateTrxPromise = contract.write.removeDelegate({
          args: [delegatee],
        });
        removeDelegateRes = await removeDelegateTrxPromise;
      }
      return removeDelegateRes;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  protected async getChainId(signer: SignerType) {
    if (!this.signer) {
      throw new Error('Signer is not provided');
    }
    const pushSigner = new Signer(this.signer);
    return pushSigner.getChainId();
  }

  protected async uploadToIPFSViaPushNode(data: string): Promise<string> {
    try {
      const response = await axiosPost(
        `${config.CORE_CONFIG[this.env!].API_BASE_URL}/v1/ipfs/upload`,
        { data }
      );
      return response.data.cid as string;
    } catch (error) {
      throw new Error('Something went wrong while uploading data to IPFS');
    }
  }

  protected getTimeBound(timeStamp?: number) {
    // for now returns 0 for non-time bound. Later it can be modified to handle time bound channels
    return 0;
  }

  protected getMinimalSetting(configuration: NotificationSettings): {
    setting: string;
    description: string;
  } {
    let notificationSetting = '';
    let notificationSettingDescription = '';
    for (let i = 0; i < configuration.length; i++) {
      const ele = configuration[i];
      if (ele.type == BOOLEAN_TYPE) {
        notificationSetting =
          notificationSetting +
          SETTING_SEPARATOR +
          BOOLEAN_TYPE +
          SETTING_DELIMITER +
          ele.default;
      }
      if (ele.type == SLIDER_TYPE) {
        if (ele.data) {
          const enabled =
            ele.data && ele.data.enabled != undefined
              ? Number(ele.data.enabled).toString()
              : DEFAULT_ENABLE_VALUE;
          const ticker = ele.data.ticker ?? DEFAULT_TICKER_VALUE;
          notificationSetting =
            notificationSetting +
            SETTING_SEPARATOR +
            SLIDER_TYPE +
            SETTING_DELIMITER +
            enabled +
            SETTING_DELIMITER +
            ele.default +
            SETTING_DELIMITER +
            ele.data.lower +
            SETTING_DELIMITER +
            ele.data.upper +
            SETTING_DELIMITER +
            ticker;
        }
      }
      if (ele.type == RANGE_TYPE) {
        if (ele.default && typeof ele.default == 'object' && ele.data) {
          const enabled =
            ele.data && ele.data.enabled != undefined
              ? Number(ele.data.enabled).toString()
              : DEFAULT_ENABLE_VALUE;
          const ticker = ele.data.ticker ?? DEFAULT_TICKER_VALUE;
          notificationSetting =
            notificationSetting +
            SETTING_SEPARATOR +
            RANGE_TYPE +
            SETTING_DELIMITER +
            enabled +
            SETTING_DELIMITER +
            ele.default.lower +
            SETTING_DELIMITER +
            ele.default.upper +
            SETTING_DELIMITER +
            ele.data.lower +
            SETTING_DELIMITER +
            ele.data.upper +
            SETTING_DELIMITER +
            ticker;
        }
      }

      notificationSettingDescription =
        notificationSettingDescription + SETTING_SEPARATOR + ele.description;
    }
    return {
      setting: notificationSetting.replace(/^\+/, ''),
      description: notificationSettingDescription.replace(/^\+/, ''),
    };
  }

  protected getMinimalUserSetting(setting: UserSetting[]) {
    if (!setting) {
      return null;
    }
    let userSetting = '';
    let numberOfSettings = 0;
    for (let i = 0; i < setting.length; i++) {
      const ele = setting[i];
      const enabled = ele.enabled ? 1 : 0;
      if (ele.enabled) numberOfSettings++;

      if (Object.keys(ele).includes('value')) {
        // slider type
        if (typeof ele.value == 'number')
          userSetting =
            userSetting +
            SLIDER_TYPE +
            SETTING_DELIMITER +
            enabled +
            SETTING_DELIMITER +
            ele.value;
        else {
          userSetting =
            userSetting +
            RANGE_TYPE +
            SETTING_DELIMITER +
            enabled +
            SETTING_DELIMITER +
            ele.value?.lower +
            SETTING_DELIMITER +
            ele.value?.upper;
        }
      } else {
        // boolean type
        userSetting = userSetting + BOOLEAN_TYPE + SETTING_DELIMITER + enabled;
      }
      if (i != setting.length - 1)
        userSetting = userSetting + SETTING_SEPARATOR;
    }
    return numberOfSettings + SETTING_SEPARATOR + userSetting;
  }

  protected async getChannelOrAliasInfo(address: string) {
    try {
      address = validateCAIP(address)
        ? address
        : getFallbackETHCAIPAddress(this.env!, this.account!);
      const channelInfo = await PUSH_CHANNEL.getChannel({
        channel: address as string,
        env: this.env,
      });
      if (channelInfo) return channelInfo;
      // // TODO: Temp fix, do a more concrete fix later
      const API_BASE_URL = getAPIBaseUrls(this.env!);
      const apiEndpoint = `${API_BASE_URL}/v1/alias`;
      const requestUrl = `${apiEndpoint}/${address}/channel`;
      const aliasInfo = await axiosGet(requestUrl)
        .then((response) => response.data)
        .catch((err) => {
          console.error(`[EPNS-SDK] - API ${requestUrl}: `, err);
        });
      const aliasInfoFromChannel = await PUSH_CHANNEL.getChannel({
        channel: aliasInfo.channel as string,
        env: this.env,
      });
      if (aliasInfoFromChannel) return aliasInfoFromChannel;
      return null;
    } catch (error) {
      return null;
    }
  }

  protected getAddressFromCaip(caipAddress: string): string {
    return caipAddress?.split(':')[caipAddress?.split(':').length - 1];
  }
}