import Constants, { ENV } from '../constants';
import {
  ChatSendOptionsType,
  GroupAccess,
  GroupDTO,
  IFeeds,
  IUser,
  MessageWithCID,
  SignerType,
  Message,
} from '../types';
import {
  GroupUpdateOptions,
  ChatListType,
  GroupCreationOptions,
  ManageGroupOptions,
  PushAPIInitializeProps,
} from './pushAPITypes';
import * as PUSH_USER from '../user';
import * as PUSH_CHAT from '../chat';
import { getAccountAddress, getWallet } from '../chat/helpers';
import { isValidETHAddress } from '../helpers';
import {
  ChatUpdateGroupProfileType,
  updateGroupProfile,
} from '../chat/updateGroupProfile';

export class PushAPI {
  private signer: SignerType;
  private account: string;
  private decryptedPgpPvtKey: string;
  private env: ENV;

  private constructor(
    signer: SignerType,
    env: ENV,
    account: string,
    decryptedPgpPvtKey: string
  ) {
    this.signer = signer;
    this.env = env;
    this.account = account;
    this.decryptedPgpPvtKey = decryptedPgpPvtKey;
  }

  static async initialize(
    signer: SignerType,
    options?: PushAPIInitializeProps
  ): Promise<PushAPI> {
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
    };

    // Get account
    // Derives account from signer if not provided
    const derivedAccount = await getAccountAddress(
      getWallet({
        account: settings.account as string | null,
        signer: signer,
      })
    );

    let decryptedPGPPrivateKey: string;

    /**
     * Decrypt PGP private key
     * If user exists, decrypts the PGP private key
     * If user does not exist, creates a new user and returns the decrypted PGP private key
     */
    const user = await PUSH_USER.get({
      account: derivedAccount,
      env: settings.env,
    });
    if (user && user.encryptedPrivateKey) {
      decryptedPGPPrivateKey = await PUSH_CHAT.decryptPGPKey({
        encryptedPGPPrivateKey: user.encryptedPrivateKey,
        signer: signer,
        toUpgrade: settings.autoUpgrade,
      });
    } else {
      const newUser = await PUSH_USER.create({
        env: settings.env,
        account: derivedAccount,
        signer,
        version: settings.version,
        origin: settings.origin,
      });
      decryptedPGPPrivateKey = newUser.decryptedPrivateKey as string;
    }

    // Initialize PushAPI instance
    return new PushAPI(
      signer,
      settings.env as ENV,
      derivedAccount,
      decryptedPGPPrivateKey
    );
  }

  profile = {
    update: async (
      name?: string,
      desc?: string,
      picture?: string
    ): Promise<IUser> => {
      return await PUSH_USER.profile.update({
        pgpPrivateKey: this.decryptedPgpPvtKey,
        account: this.account,
        profile: {
          name: name,
          desc: desc,
          picture: picture,
        },
        env: this.env,
      });
    },
  };

  chat = {
    list: async (
      type: `${ChatListType}`,
      options?: {
        /**
         * @default 1
         */
        page?: number;
        limit?: number;
      }
    ): Promise<IFeeds[]> => {
      const listParams = {
        account: this.account,
        pgpPrivateKey: this.decryptedPgpPvtKey,
        page: options?.page,
        limit: options?.limit,
        env: this.env,
        toDecrypt: true,
      };

      switch (type) {
        case ChatListType.CHATS:
          return await PUSH_CHAT.chats(listParams);
        case ChatListType.REQUESTS:
          return await PUSH_CHAT.requests(listParams);
        default:
          throw new Error('Invalid Chat List Type');
      }
    },

    latest: async (to: string) => {
      const { threadHash } = await PUSH_CHAT.conversationHash({
        conversationId: to,
        account: this.account,
        env: this.env,
      });

      return await PUSH_CHAT.latest({
        threadhash: threadHash,
        toDecrypt: true,
        pgpPrivateKey: this.decryptedPgpPvtKey,
        account: this.account,
        env: this.env,
      });
    },

    history: async (
      to: string,
      options?: {
        reference?: string | null;
        limit?: number;
      }
    ) => {
      let reference: string;

      if (!options?.reference) {
        const { threadHash } = await PUSH_CHAT.conversationHash({
          conversationId: to,
          account: this.account,
          env: this.env,
        });
        reference = threadHash;
      } else {
        reference = options.reference;
      }

      return await PUSH_CHAT.history({
        account: this.account,
        env: this.env,
        threadhash: reference,
        pgpPrivateKey: this.decryptedPgpPvtKey,
        toDecrypt: true,
        limit: options?.limit,
      });
    },

    send: async (to: string, options: Message): Promise<MessageWithCID> => {
      const sendParams: ChatSendOptionsType = {
        message: options,
        to: to,
        signer: this.signer,
        pgpPrivateKey: this.decryptedPgpPvtKey,
        env: this.env,
      };
      return await PUSH_CHAT.send(sendParams);
    },

    /*permissions: (): void => {
      console.warn('Fetching chat permissions... Coming Soon');
    },

    info: (): void => {
      console.warn('Fetching chat info...  Coming Soon');
    },*/

    group: {
      create: async (name: string, options?: GroupCreationOptions) => {
        const groupParams: PUSH_CHAT.ChatCreateGroupType = {
          groupName: name,
          groupDescription: options?.description,
          members: options?.members ? options.members : [],
          groupImage: options?.image,
          admins: options?.admins ? options.admins : [],
          rules: {
            groupAccess: options?.rules?.entry,
            chatAccess: options?.rules?.chat,
          },
          isPublic: options?.private || false,
          signer: this.signer,
          pgpPrivateKey: this.decryptedPgpPvtKey,
          env: this.env,
        };

        return await PUSH_CHAT.createGroup(groupParams);
      },

      permissions: async (chatId: string): Promise<GroupAccess> => {
        const getGroupAccessOptions: PUSH_CHAT.GetGroupAccessType = {
          chatId,
          did: this.account,
          env: this.env,
        };
        return await PUSH_CHAT.getGroupAccess(getGroupAccessOptions);
      },

      info: async (chatId: string): Promise<GroupDTO> => {
        return await PUSH_CHAT.getGroup({
          chatId: chatId,
          env: this.env,
        });
      },

      update: async (
        chatId: string,
        options: GroupUpdateOptions
      ): Promise<GroupDTO> => {
        // Fetch Group Details
        const group = await PUSH_CHAT.getGroup({
          chatId: chatId,
          env: this.env,
        });
        if (!group) {
          throw new Error('Group not found');
        }

        const updateGroupProfileOptions: ChatUpdateGroupProfileType = {
          chatId: chatId,
          groupName: options.name ? options.name : group.groupName,
          groupImage: options.image ? options.image : group.groupImage,
          groupDescription: options.description
            ? options.description
            : group.groupDescription,
          scheduleAt: options.scheduleAt
            ? options.scheduleAt
            : group.scheduleAt,
          scheduleEnd: options.scheduleEnd
            ? options.scheduleEnd
            : group.scheduleEnd,
          status: options.status ? options.status : group.status,
          meta: options.meta ? options.meta : group.meta,
          rules: options.rules ? options.rules : group.rules,
          account: this.account,
          signer: this.signer,
          env: this.env,
        };
        return await updateGroupProfile(updateGroupProfileOptions);
      },

      manage: async (
        action: 'ADD' | 'REMOVE',
        options: ManageGroupOptions
      ): Promise<GroupDTO> => {
        const { chatid, role, accounts } = options;

        const validRoles = ['ADMIN', 'MEMBER'];
        if (!validRoles.includes(role)) {
          throw new Error('Invalid role provided.');
        }

        if (!accounts || accounts.length === 0) {
          throw new Error('accounts array cannot be empty!');
        }

        accounts.forEach((account) => {
          if (!isValidETHAddress(account)) {
            throw new Error(`Invalid account address: ${account}`);
          }
        });

        const env = this.env;
        const account = this.account;
        const signer = this.signer;

        let response: GroupDTO;

        switch (action) {
          case 'ADD':
            if (role === 'ADMIN') {
              response = await PUSH_CHAT.addAdmins({
                chatId: chatid,
                admins: accounts,
                env,
                account,
                signer: signer,
              });
            } else if (role === 'MEMBER') {
              response = await PUSH_CHAT.addMembers({
                chatId: chatid,
                members: accounts,
                env,
                account,
                signer: signer,
              });
            } else {
              throw new Error('Invalid role provided.');
            }
            break;

          case 'REMOVE':
            if (role === 'ADMIN') {
              response = await PUSH_CHAT.removeAdmins({
                chatId: chatid,
                admins: accounts,
                env,
                account,
                signer: signer,
              });
            } else if (role === 'MEMBER') {
              response = await PUSH_CHAT.removeMembers({
                chatId: chatid,
                members: accounts,
                env,
                account,
                signer: signer,
              });
            } else {
              throw new Error('Invalid role provided.');
            }
            break;

          default:
            throw new Error('Invalid action provided.');
        }
        return response;
      },
    },
  };
}
