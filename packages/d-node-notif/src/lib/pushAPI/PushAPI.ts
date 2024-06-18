import Constants, { ENV, PACKAGE_BUILD } from '../constants';
import { SignerType, ProgressHookType } from '../types';
import { InfoOptions, PushAPIInitializeProps } from './pushAPITypes';
import * as PUSH_USER from '../user';
import { getAccountAddress, getWallet } from '../chat/helpers';
import { PushStream, StreamType } from '../pushstream/PushStream';
import { Channel } from '../pushNotification/channel';
import { Notification } from '../pushNotification/notification';
import {
  PushStreamInitializeProps,
  STREAM,
} from '../pushstream/pushStreamTypes';
import { ALPHA_FEATURE_CONFIG } from '../config';
import { decryptPGPKey, isValidNFTCAIP, walletToPCAIP10 } from '../helpers';
import { LRUCache } from 'lru-cache';
import { cache } from '../helpers/cache';
import { v4 as uuidv4 } from 'uuid';

export class PushAPI {
  public signer?: SignerType;
  private readMode: boolean;
  private alpha: { feature: string[] };
  public account: string;
  public chainWiseAccount: string;
  public decryptedPgpPvtKey?: string;
  public pgpPublicKey?: string;
  public env: ENV;
  private progressHook?: (progress: ProgressHookType) => void;
  private cache: LRUCache<string, any>;

  public stream!: PushStream;
  // Notification
  public channel!: Channel;
  public notification!: Notification;
  public uid: string;
  // error object to maintain errors and warnings
  public errors: { type: 'WARN' | 'ERROR'; message: string }[];

  private constructor(
    env: ENV,
    account: string,
    readMode: boolean,
    alpha: { feature: string[] },
    decryptedPgpPvtKey?: string,
    pgpPublicKey?: string,
    signer?: SignerType,
    progressHook?: (progress: ProgressHookType) => void,
    initializationErrors?: { type: 'WARN' | 'ERROR'; message: string }[]
  ) {
    this.signer = signer;
    this.readMode = readMode;
    this.alpha = alpha;
    this.env = env;
    this.account = account;
    this.chainWiseAccount = walletToPCAIP10(account);
    this.decryptedPgpPvtKey = decryptedPgpPvtKey;
    this.pgpPublicKey = pgpPublicKey;
    this.progressHook = progressHook;
    // Instantiate the notification classes
    this.channel = new Channel(this.signer, this.env, this.account);
    this.notification = new Notification(this.signer, this.env, this.account);
    this.uid = uuidv4();
    this.cache = cache;

    this.errors = initializationErrors || [];
  }
  // Overloaded initialize method signatures
  static async initialize(
    signer?: SignerType | null,
    options?: PushAPIInitializeProps
  ): Promise<PushAPI>;
  static async initialize(options?: PushAPIInitializeProps): Promise<PushAPI>;

  static async initialize(...args: any[]): Promise<PushAPI> {
    try {
      let signer: SignerType | undefined;
      let options: PushAPIInitializeProps | undefined;
      let decryptedPGPPrivateKey: string | undefined;

      if (args.length === 1 && typeof args[0] === 'object') {
        // This branch handles both the single options object and the single signer scenario.
        if ('account' in args[0] && typeof args[0].account === 'string') {
          // Single options object provided.
          options = args[0];
        } else {
          // Only signer provided.
          [signer] = args;
        }
      } else if (args.length === 2) {
        // Separate signer and options arguments provided.
        [signer, options] = args;
      } else {
        // Handle other cases or throw an error.
        throw new Error('Invalid arguments provided to initialize method.');
      }

      // Check for decryptedPGPPrivateKey in options, regardless of how options was assigned.
      if (
        options &&
        'decryptedPGPPrivateKey' in options &&
        typeof options.decryptedPGPPrivateKey === 'string'
      ) {
        decryptedPGPPrivateKey = options.decryptedPGPPrivateKey;
      }

      if (!signer && !options?.account) {
        throw new Error("Either 'signer' or 'account' must be provided.");
      }

      // Determine readMode based on the presence of signer and decryptedPGPPrivateKey
      const readMode = !signer && !decryptedPGPPrivateKey;

      // Default options
      const defaultOptions: PushAPIInitializeProps = {
        env: ENV.STAGING,
        version: Constants.ENC_TYPE_V3,
        autoUpgrade: true,
        account: null,
      };

      // Settings object
      // Default options are overwritten by the options passed in the initialize method
      const settings = {
        ...defaultOptions,
        ...options,
        version: options?.version || defaultOptions.version,
        versionMeta: options?.versionMeta || defaultOptions.versionMeta,
        autoUpgrade:
          options?.autoUpgrade !== undefined
            ? options?.autoUpgrade
            : defaultOptions.autoUpgrade,
        alpha:
          options?.alpha && options.alpha.feature
            ? options.alpha
            : ALPHA_FEATURE_CONFIG[PACKAGE_BUILD],
      };

      const initializationErrors: {
        type: 'WARN' | 'ERROR';
        message: string;
      }[] = [];

      // Get account
      // Derives account from signer if not provided

      let derivedAccount;
      if (signer) {
        derivedAccount = await getAccountAddress(
          getWallet({
            account: settings.account as string | null,
            signer: signer,
          })
        );
      } else {
        derivedAccount = options?.account;
      }

      if (!derivedAccount) {
        throw new Error('Account could not be derived.');
      }

      let pgpPublicKey: string | undefined;

      /**
       * Decrypt PGP private key
       * If user exists, decrypts the PGP private key
       * If user does not exist, creates a new user and returns the decrypted PGP private key
       */
      // TODO: Uncomment this block after this is handled by validator nodes
      // const user = await PUSH_USER.get({
      //   account: derivedAccount,
      //   env: settings.env,
      // });

      // if (user && user.publicKey) {
      //   pgpPublicKey = user.publicKey;
      // }

      // if (!readMode) {
      //   try {
      //     if (user && user.encryptedPrivateKey) {
      //       if (!decryptedPGPPrivateKey) {
      //         decryptedPGPPrivateKey = await decryptPGPKey({
      //           encryptedPGPPrivateKey: user.encryptedPrivateKey,
      //           signer: signer,
      //           toUpgrade: settings.autoUpgrade,
      //           additionalMeta: settings.versionMeta,
      //           progressHook: settings.progressHook,
      //           env: settings.env,
      //         });
      //       }
      //     } else {
      //       const newUser = await PUSH_USER.create({
      //         env: settings.env,
      //         account: derivedAccount,
      //         signer,
      //         version: settings.version,
      //         additionalMeta: settings.versionMeta,
      //         origin: settings.origin,
      //         progressHook: settings.progressHook,
      //       });
      //       decryptedPGPPrivateKey = newUser.decryptedPrivateKey as string;
      //       pgpPublicKey = newUser.publicKey;
      //     }
      //   } catch (error) {
      //     const decryptionError =
      //       'Error decrypting PGP private key ...swiching to Guest mode';
      //     initializationErrors.push({
      //       type: 'ERROR',
      //       message: decryptionError,
      //     });
      //     console.error(decryptionError);
      //     if (isValidNFTCAIP(derivedAccount)) {
      //       const nftDecryptionError =
      //         'NFT Account Detected. If this NFT was recently transferred to you, please ensure you have received the correct password from the previous owner. Alternatively, you can reinitialize for a fresh start. Please be aware that reinitialization will result in the loss of all previous account data.';

      //       initializationErrors.push({
      //         type: 'WARN',
      //         message: nftDecryptionError,
      //       });
      //       console.warn(nftDecryptionError);
      //     }
      //     readMode = true;
      //   }
      // }
      // Initialize PushAPI instance
      const api = new PushAPI(
        settings.env as ENV,
        derivedAccount,
        readMode,
        settings.alpha,
        decryptedPGPPrivateKey,
        pgpPublicKey,
        signer,
        settings.progressHook,
        initializationErrors
      );

      return api;
    } catch (error) {
      console.error('Error initializing PushAPI:', error);
      throw error; // or handle it more gracefully if desired
    }
  }

  async initStream(
    listen: StreamType[],
    options?: PushStreamInitializeProps
  ): Promise<PushStream> {
    if (this.stream) {
      throw new Error('Stream is already initialized.');
    }

    this.stream = await PushStream.initialize(
      this.account,
      listen,
      this.env,
      this.decryptedPgpPvtKey,
      this.progressHook,
      this.signer,
      options
    );

    return this.stream;
  }

  async info(options?: InfoOptions) {
    const accountToUse = options?.overrideAccount || this.account;
    return await PUSH_USER.get({
      account: accountToUse,
      env: this.env,
    });
  }

  readmode(): boolean {
    return this.readMode;
  }

  static ensureSignerMessage(): string {
    return 'Operation not allowed in read-only mode. Signer is required.';
  }
}
