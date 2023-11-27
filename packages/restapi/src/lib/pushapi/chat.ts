import { ENV, MessageType } from '../constants';
import {
  ChatSendOptionsType,
  GroupAccess,
  GroupDTO,
  IFeeds,
  MessageWithCID,
  SignerType,
  Message,
  ProgressHookType,
  IUser,
  IMessageIPFS,
} from '../types';
import {
  GroupUpdateOptions,
  ChatListType,
  GroupCreationOptions,
  ManageGroupOptions,
} from './pushAPITypes';
import * as PUSH_USER from '../user';
import * as PUSH_CHAT from '../chat';
import { getUserDID } from '../chat/helpers';
import { isValidETHAddress } from '../helpers';
import {
  ChatUpdateGroupProfileType,
  updateGroupProfile,
} from '../chat/updateGroupProfile';
import { User } from './user';
import { PushAPI } from './PushAPI';
export class Chat {
  private userInstance: User;

  constructor(
    private account: string,
    private env: ENV,
    private decryptedPgpPvtKey?: string,
    private signer?: SignerType,
    private progressHook?: (progress: ProgressHookType) => void
  ) {
    this.userInstance = new User(this.account, this.env);
  }

  async list(
    type: `${ChatListType}`,
    options?: {
      /**
       * @default 1
       */
      page?: number;
      limit?: number;
      overrideAccount?: string;
    }
  ): Promise<IFeeds[]> {
    const accountToUse = options?.overrideAccount || this.account;

    const listParams = {
      account: accountToUse,
      pgpPrivateKey: this.decryptedPgpPvtKey,
      page: options?.page,
      limit: options?.limit,
      env: this.env,
      toDecrypt: !!this.signer, // Set to false if signer is undefined or null,
    };

    switch (type) {
      case ChatListType.CHATS:
        return await PUSH_CHAT.chats(listParams);
      case ChatListType.REQUESTS:
        return await PUSH_CHAT.requests(listParams);
      default:
        throw new Error('Invalid Chat List Type');
    }
  }
  async latest(target: string) {
    const { threadHash } = await PUSH_CHAT.conversationHash({
      conversationId: target,
      account: this.account,
      env: this.env,
    });
    if (!threadHash) return {};

    return await PUSH_CHAT.latest({
      threadhash: threadHash,
      toDecrypt: !!this.signer, // Set to false if signer is undefined or null,
      pgpPrivateKey: this.decryptedPgpPvtKey,
      account: this.account,
      env: this.env,
    });
  }

  async history(
    target: string,
    options?: {
      reference?: string | null;
      limit?: number;
    }
  ) {
    let reference: string;

    if (!options?.reference) {
      const { threadHash } = await PUSH_CHAT.conversationHash({
        conversationId: target,
        account: this.account,
        env: this.env,
      });
      reference = threadHash;
    } else {
      reference = options.reference;
    }

    if (!reference) return [];

    return await PUSH_CHAT.history({
      account: this.account,
      env: this.env,
      threadhash: reference,
      pgpPrivateKey: this.decryptedPgpPvtKey,
      toDecrypt: !!this.signer, // Set to false if signer is undefined or null,
      limit: options?.limit,
    });
  }

  async send(recipient: string, options: Message): Promise<MessageWithCID> {
    if (!this.signer) {
      throw new Error(PushAPI.ensureSignerMessage());
    }

    if (!options.type) {
      options.type = MessageType.TEXT;
    }
    const sendParams: ChatSendOptionsType = {
      message: options,
      to: recipient,
      signer: this.signer,
      pgpPrivateKey: this.decryptedPgpPvtKey,
      env: this.env,
    };
    return await PUSH_CHAT.send(sendParams);
  }

  async decrypt(messagePayloads: IMessageIPFS[]) {
    if (!this.signer) {
      throw new Error(PushAPI.ensureSignerMessage());
    }
    return await PUSH_CHAT.decryptConversation({
      pgpPrivateKey: this.decryptedPgpPvtKey,
      env: this.env,
      messages: messagePayloads,
      connectedUser: await this.userInstance.info(),
    });
  }

  async accept(target: string): Promise<string> {
    if (!this.signer) {
      throw new Error(PushAPI.ensureSignerMessage());
    }
    return await PUSH_CHAT.approve({
      senderAddress: target,
      env: this.env,
      account: this.account,
      signer: this.signer,
      pgpPrivateKey: this.decryptedPgpPvtKey,
    });
  }

  async reject(target: string): Promise<void> {
    if (!this.signer) {
      throw new Error(PushAPI.ensureSignerMessage());
    }
    await PUSH_CHAT.reject({
      senderAddress: target,
      env: this.env,
      account: this.account,
      signer: this.signer,
      pgpPrivateKey: this.decryptedPgpPvtKey,
    });
  }

  async block(users: Array<string>): Promise<IUser> {
    if (!this.signer || !this.decryptedPgpPvtKey) {
      throw new Error(PushAPI.ensureSignerMessage());
    }
    const user = await PUSH_USER.get({
      account: this.account,
      env: this.env,
    });

    for (const element of users) {
      if (!isValidETHAddress(element)) {
        throw new Error('Invalid address in the users: ' + element);
      }
    }

    if (!user.profile.blockedUsersList) {
      user.profile.blockedUsersList = [];
    }

    user.profile.blockedUsersList = [
      ...new Set([...user.profile.blockedUsersList, ...users]),
    ];

    return await PUSH_USER.profile.update({
      pgpPrivateKey: this.decryptedPgpPvtKey,
      account: this.account,
      profile: {
        name: user.profile.name!,
        desc: user.profile.desc!,
        picture: user.profile.picture!,
        blockedUsersList: user.profile.blockedUsersList,
      },
      env: this.env,
      progressHook: this.progressHook,
    });
  }

  async unblock(users: Array<string>): Promise<IUser> {
    if (!this.signer || !this.decryptedPgpPvtKey) {
      throw new Error(PushAPI.ensureSignerMessage());
    }
    const user = await PUSH_USER.get({
      account: this.account,
      env: this.env,
    });

    for (const element of users) {
      if (!isValidETHAddress(element)) {
        throw new Error('Invalid address in the users: ' + element);
      }
    }

    if (!user.profile.blockedUsersList) {
      return user;
    }

    const userDIDsPromises = users.map(async (user) => {
      return (await getUserDID(user, this.env)).toLowerCase();
    });
    const userDIDs = await Promise.all(userDIDsPromises);

    user.profile.blockedUsersList = user.profile.blockedUsersList.filter(
      (blockedUser) => {
        !userDIDs.includes(blockedUser.toLowerCase());
      }
    );

    return await PUSH_USER.profile.update({
      pgpPrivateKey: this.decryptedPgpPvtKey,
      account: this.account,
      profile: {
        name: user.profile.name!,
        desc: user.profile.desc!,
        picture: user.profile.picture!,
        blockedUsersList: user.profile.blockedUsersList,
      },
      env: this.env,
      progressHook: this.progressHook,
    });
  }

  group = {
    create: async (name: string, options?: GroupCreationOptions) => {
      if (!this.signer) {
        throw new Error(PushAPI.ensureSignerMessage());
      }
      const groupParams: PUSH_CHAT.ChatCreateGroupType = {
        groupName: name,
        groupDescription: options?.description,
        members: options?.members ? options.members : [],
        groupImage: options?.image,
        admins: options?.admins ? options.admins : [],
        rules: options?.rules,
        isPublic: !options?.private,
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
      if (!this.signer) {
        throw new Error(PushAPI.ensureSignerMessage());
      }
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
        scheduleAt: options.scheduleAt ? options.scheduleAt : group.scheduleAt,
        scheduleEnd: options.scheduleEnd
          ? options.scheduleEnd
          : group.scheduleEnd,
        status: options.status ? options.status : group.status,
        meta: options.meta ? options.meta : group.meta,
        rules: options.rules ? options.rules : group.rules,
        account: this.account,
        pgpPrivateKey: this.decryptedPgpPvtKey,
        env: this.env,
      };
      return await updateGroupProfile(updateGroupProfileOptions);
    },

    add: async (chatId: string, options: ManageGroupOptions) => {
      if (!this.signer) {
        throw new Error(PushAPI.ensureSignerMessage());
      }
      const { role, accounts } = options;

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

      if (role === 'ADMIN') {
        return await PUSH_CHAT.addAdmins({
          chatId: chatId,
          admins: accounts,
          env: this.env,
          account: this.account,
          signer: this.signer,
          pgpPrivateKey: this.decryptedPgpPvtKey,
        });
      } else {
        return await PUSH_CHAT.addMembers({
          chatId: chatId,
          members: accounts,
          env: this.env,
          account: this.account,
          signer: this.signer,
          pgpPrivateKey: this.decryptedPgpPvtKey,
        });
      }
    },

    remove: async (chatId: string, options: ManageGroupOptions) => {
      if (!this.signer) {
        throw new Error(PushAPI.ensureSignerMessage());
      }
      const { role, accounts } = options;

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

      if (role === 'ADMIN') {
        return await PUSH_CHAT.removeAdmins({
          chatId: chatId,
          admins: accounts,
          env: this.env,
          account: this.account,
          signer: this.signer,
          pgpPrivateKey: this.decryptedPgpPvtKey,
        });
      } else {
        return await PUSH_CHAT.removeMembers({
          chatId: chatId,
          members: accounts,
          env: this.env,
          account: this.account,
          signer: this.signer,
          pgpPrivateKey: this.decryptedPgpPvtKey,
        });
      }
    },

    join: async (target: string): Promise<GroupDTO> => {
      if (!this.signer) {
        throw new Error(PushAPI.ensureSignerMessage());
      }
      const status = await PUSH_CHAT.getGroupMemberStatus({
        chatId: target,
        did: this.account,
        env: this.env,
      });

      if (status.isPending) {
        await PUSH_CHAT.approve({
          senderAddress: target,
          env: this.env,
          account: this.account,
          signer: this.signer,
          pgpPrivateKey: this.decryptedPgpPvtKey,
        });
      } else if (!status.isMember) {
        return await PUSH_CHAT.addMembers({
          chatId: target,
          members: [this.account],
          env: this.env,
          account: this.account,
          signer: this.signer,
          pgpPrivateKey: this.decryptedPgpPvtKey,
        });
      }

      return await PUSH_CHAT.getGroup({
        chatId: target,
        env: this.env,
      });
    },

    leave: async (target: string): Promise<GroupDTO> => {
      if (!this.signer) {
        throw new Error(PushAPI.ensureSignerMessage());
      }
      const status = await PUSH_CHAT.getGroupMemberStatus({
        chatId: target,
        did: this.account,
        env: this.env,
      });

      if (status.isAdmin) {
        return await PUSH_CHAT.removeAdmins({
          chatId: target,
          admins: [this.account],
          env: this.env,
          account: this.account,
          signer: this.signer,
          pgpPrivateKey: this.decryptedPgpPvtKey,
        });
      } else {
        return await PUSH_CHAT.removeMembers({
          chatId: target,
          members: [this.account],
          env: this.env,
          account: this.account,
          signer: this.signer,
          pgpPrivateKey: this.decryptedPgpPvtKey,
        });
      }
    },
    reject: async (target: string): Promise<void> => {
      if (!this.signer) {
        throw new Error(PushAPI.ensureSignerMessage());
      }
      await PUSH_CHAT.reject({
        senderAddress: target,
        env: this.env,
        account: this.account,
        signer: this.signer,
        pgpPrivateKey: this.decryptedPgpPvtKey,
      });
    },
  };
}
