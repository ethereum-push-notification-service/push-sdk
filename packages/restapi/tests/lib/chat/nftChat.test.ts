import * as path from 'path';
import * as dotenv from 'dotenv';
import { PushAPI } from '../../../src/lib/pushapi/PushAPI';
import { expect } from 'chai';
import { ethers } from 'ethers';
import CONSTANTS from '../../../src/lib/constantsV2';
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from 'unique-names-generator';
import { PushStream } from '../../../src/lib/pushstream/PushStream';
import { ENCRYPTION_TYPE } from '../../../src/lib/constants';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = CONSTANTS.ENV.DEV;
const showAPIResponse = false;

describe('PushAPI.chat functionality For NFT Profile', () => {
  let userAlice: PushAPI, userBob: PushAPI, userKate: PushAPI, stream;
  let nftAccount1: string, nftAccount2: string, nftAccount3: string;
  let groupChatId: string;

  const eventlistener = async (
    stream: PushStream,
    eventName: string
  ): Promise<void> => {
    stream.on(eventName, (data: any) => {
      if (showAPIResponse) {
        console.debug('Stream Event Received');
        console.debug(data);
        console.debug('\n');
      }
    });
  };

  const randomWallet1 = ethers.Wallet.createRandom().address;
  const randomWallet2 = ethers.Wallet.createRandom().address;
  const randomWallet3 = ethers.Wallet.createRandom().address;

  /***************** SAMPLE GROUP DATA ****************************/
  const groupName = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
  });
  const groupDescription = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
  });
  const groupImage =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAvklEQVR4AcXBsW2FMBiF0Y8r3GQb6jeBxRauYRpo4yGQkMd4A7kg7Z/GUfSKe8703fKDkTATZsJsrr0RlZSJ9r4RLayMvLmJjnQS1d6IhJkwE2bT13U/DBzp5BN73xgRZsJMmM1HOolqb/yWiWpvjJSUiRZWopIykTATZsJs5g+1N6KSMiO1N/5DmAkzYTa9Lh6MhJkwE2ZzSZlo7xvRwson3txERzqJhJkwE2bT6+JhoKTMJ2pvjAgzYSbMfgDlXixqjH6gRgAAAABJRU5ErkJggg==';
  /***************** SAMPLE GROUP DATA ****************************/

  before(async () => {
    // Initialization of shared variables
    nftAccount1 = `nft:eip155:${process.env['NFT_CHAIN_ID_1']}:${process.env['NFT_CONTRACT_ADDRESS_1']}:${process.env['NFT_TOKEN_ID_1']}`;
    nftAccount2 = `nft:eip155:${process.env['NFT_CHAIN_ID_2']}:${process.env['NFT_CONTRACT_ADDRESS_2']}:${process.env['NFT_TOKEN_ID_2']}`;
    nftAccount3 = `nft:eip155:${process.env['NFT_CHAIN_ID_3']}:${process.env['NFT_CONTRACT_ADDRESS_3']}:${process.env['NFT_TOKEN_ID_3']}`;

    userAlice = await PushAPI.initialize(
      new ethers.Wallet(
        `0x${process.env['NFT_HOLDER_WALLET_PRIVATE_KEY_1'] || ''}`
      ),
      {
        env,
        account: nftAccount1,
      }
    );

    // Reinitialize for fresh start
    await userAlice.reinitialize({
      versionMeta: {
        NFTPGP_V1: { password: process.env['NFT_PROFILE_PASSWORD_1'] || '' },
      },
    });

    userBob = await PushAPI.initialize(
      new ethers.Wallet(
        `0x${process.env['NFT_HOLDER_WALLET_PRIVATE_KEY_2'] || ''}`
      ),
      {
        env,
        account: nftAccount2,
      }
    );

    // Reinitialize for fresh start
    await userBob.reinitialize({
      versionMeta: {
        NFTPGP_V1: { password: process.env['NFT_PROFILE_PASSWORD_2'] || '' },
      },
    });

    userKate = await PushAPI.initialize(
      new ethers.Wallet(
        `0x${process.env['NFT_HOLDER_WALLET_PRIVATE_KEY_3'] || ''}`
      ),
      {
        env,
        account: nftAccount3,
      }
    );

    // Reinitialize for fresh start
    await userKate.reinitialize({
      versionMeta: {
        NFTPGP_V1: { password: process.env['NFT_PROFILE_PASSWORD_3'] || '' },
      },
    });

    // Stream Initialization
    stream = await userAlice.initStream(
      [CONSTANTS.STREAM.CHAT, CONSTANTS.STREAM.CHAT_OPS],
      {
        filter: {
          channels: ['*'],
          chats: ['*'],
        },
        connection: {
          auto: true,
          retries: 3,
        },
        raw: true,
      }
    );

    await stream.connect();

    stream.on(CONSTANTS.STREAM.CONNECT, () => {
      console.debug('Stream Connected');
    });

    stream.on(CONSTANTS.STREAM.DISCONNECT, () => {
      console.debug('Stream Disconnected');
    });

    // Listen stream events to receive websocket events
    console.debug(`Listening ${CONSTANTS.STREAM.CHAT} Events`);
    eventlistener(stream, CONSTANTS.STREAM.CHAT);
    console.debug(`Listening ${CONSTANTS.STREAM.CHAT_OPS} Events`);
    eventlistener(stream, CONSTANTS.STREAM.CHAT_OPS);
    console.debug('\n\n');
  });

  it('should change Profile Password', async () => {
    console.debug('PushAPI.encryption.update');
    const updatedEncryption = await userAlice.encryption.update(
      ENCRYPTION_TYPE.NFTPGP_V1,
      {
        versionMeta: {
          NFTPGP_V1: {
            password: '#@MyNewPass001',
          },
        },
      }
    );
    if (showAPIResponse) {
      console.info(updatedEncryption);
    }
    console.debug('PushAPI.group.reject | Response - 200 OK\n\n');

    // revert
    await userAlice.encryption.update(ENCRYPTION_TYPE.NFTPGP_V1, {
      versionMeta: {
        NFTPGP_V1: {
          password: process.env['NFT_PROFILE_PASSWORD_1'] || '',
        },
      },
    });
  });

  it('should list chats and requests correctly', async () => {
    console.debug('PushAPI.chat.list');
    const aliceChats = await userAlice.chat.list(
      CONSTANTS.CHAT.LIST_TYPE.CHATS
    );
    const aliceRequests = await userAlice.chat.list(
      CONSTANTS.CHAT.LIST_TYPE.REQUESTS
    );
    if (showAPIResponse) {
      console.info(aliceChats);
      console.info(aliceRequests);
    }
    console.debug('PushAPI.chat.list | Response - 200 OK\n\n');
  });

  it('should get the latest chat correctly', async () => {
    console.debug('PushAPI.chat.latest');
    const aliceLatestChatWithBob = await userAlice.chat.latest(nftAccount2);
    if (showAPIResponse) {
      console.info(aliceLatestChatWithBob);
    }
    console.debug('PushAPI.chat.latest | Response - 200 OK\n\n');
  });

  it('should retrieve chat history correctly', async () => {
    console.debug('PushAPI.chat.history');
    const aliceChatHistoryWithBob = await userAlice.chat.history(nftAccount2);
    if (showAPIResponse) {
      console.info(aliceChatHistoryWithBob);
    }
    console.debug('PushAPI.chat.history | Response - 200 OK\n\n');
  });

  it('should send a chat message correctly', async () => {
    console.debug('PushAPI.chat.send');
    const aliceMessagesBob = await userAlice.chat.send(nftAccount2, {
      content: 'Hello Bob!',
      type: CONSTANTS.CHAT.MESSAGE_TYPE.TEXT,
    });
    if (showAPIResponse) {
      console.info(aliceMessagesBob);
    }
    console.debug('PushAPI.chat.send | Response - 200 OK\n\n');
  });

  it('should accept a chat correctly', async () => {
    console.debug('PushAPI.chat.accept');
    const bobAcceptsRequest = await userBob.chat.accept(nftAccount1);
    if (showAPIResponse) {
      console.info(bobAcceptsRequest);
    }
    console.debug('PushAPI.chat.accept | Response - 200 OK\n\n');
  });

  it('should reject a chat correctly', async () => {
    console.debug('PushAPI.chat.reject');
    await userKate.chat.send(nftAccount1, {
      content: 'Sending malicious message',
      type: CONSTANTS.CHAT.MESSAGE_TYPE.TEXT,
    });
    const AliceRejectsRequest = await userAlice.chat.reject(nftAccount3);
    if (showAPIResponse) {
      console.info(AliceRejectsRequest);
    }
    console.debug('PushAPI.chat.reject | Response - 200 OK\n\n');
  });

  it('should block a chat correctly', async () => {
    console.debug('PushAPI.chat.block');
    const AliceBlocksBob = await userAlice.chat.block([nftAccount2]);
    if (showAPIResponse) {
      console.info(AliceBlocksBob);
    }
    console.debug('PushAPI.chat.block | Response - 200 OK\n\n');
  });

  it('should unblock a chat correctly', async () => {
    console.debug('PushAPI.chat.unblock');
    const AliceUnblocksBob = await userAlice.chat.unblock([nftAccount2]);
    if (showAPIResponse) {
      console.info(AliceUnblocksBob);
    }
    console.debug('PushAPI.chat.unblock | Response - 200 OK\n\n');
  });

  it('should create a group correctly', async () => {
    console.debug('PushAPI.group.create');
    const createdGroup = await userAlice.chat.group.create(groupName, {
      description: groupDescription,
      image: groupImage,
      members: [randomWallet1, randomWallet2],
      admins: [],
      private: false,
    });
    groupChatId = createdGroup.chatId;
    if (showAPIResponse) {
      console.info(createdGroup);
    }
    console.debug('PushAPI.group.create | Response - 200 OK\n\n');
  });

  it('should retrieve group permissions correctly', async () => {
    console.debug('PushAPI.group.permissions');
    const grouppermissions = await userAlice.chat.group.permissions(
      groupChatId
    );
    if (showAPIResponse) {
      console.info(grouppermissions);
    }
    console.debug('PushAPI.group.permissions | Response - 200 OK\n\n');
  });

  it('should retrieve group info correctly', async () => {
    console.debug('PushAPI.group.info');
    const groupInfo = await userAlice.chat.group.info(groupChatId);
    if (showAPIResponse) {
      console.info(groupInfo);
    }
    console.debug('PushAPI.group.info | Response - 200 OK\n\n');
  });

  it('should update a group correctly', async () => {
    console.debug('PushAPI.group.update');
    const updatedGroup = await userAlice.chat.group.update(groupChatId, {
      description: 'Updated Description',
    });
    if (showAPIResponse) {
      console.info(updatedGroup);
    }
    console.debug('PushAPI.group.update | Response - 200 OK\n\n');
  });

  it('should add a member to the group correctly', async () => {
    console.debug('PushAPI.group.add');
    const addMember = await userAlice.chat.group.add(groupChatId, {
      role: 'MEMBER',
      accounts: [randomWallet3],
    });
    if (showAPIResponse) {
      console.info(addMember);
    }
    console.debug('PushAPI.group.add | Response - 200 OK\n\n');
  });

  it('should remove a member from the group correctly', async () => {
    console.debug('PushAPI.group.remove');
    const removeMember = await userAlice.chat.group.remove(groupChatId, {
      role: 'MEMBER',
      accounts: [randomWallet3],
    });
    if (showAPIResponse) {
      console.info(removeMember);
    }
    console.debug('PushAPI.group.remove | Response - 200 OK\n\n');
  });

  it('should join a group correctly', async () => {
    console.debug('PushAPI.group.join');
    const joinGrp = await userBob.chat.group.join(groupChatId);
    if (showAPIResponse) {
      console.info(joinGrp);
    }
    console.debug('PushAPI.group.join | Response - 200 OK\n\n');
  });

  it('should leave a group correctly', async () => {
    console.debug('PushAPI.group.leave');
    const leaveGrp = await userBob.chat.group.leave(groupChatId);
    if (showAPIResponse) {
      console.info(leaveGrp);
    }
    console.debug('PushAPI.group.leave | Response - 200 OK\n\n');
  });

  it('should reject a group invite correctly', async () => {
    console.debug('PushAPI.group.reject');
    const sampleGrp = await userAlice.chat.group.create('Sample Grp', {
      description: groupDescription,
      image: groupImage,
      members: [nftAccount2],
      admins: [],
      private: true,
    });
    await userBob.chat.group.reject(sampleGrp.chatId);
    console.debug('PushAPI.group.reject | Response - 200 OK\n\n');
  });
});
