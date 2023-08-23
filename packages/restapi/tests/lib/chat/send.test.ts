import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { create, get } from '../../../src/lib/user';
import { ethers } from 'ethers';
import Constants, { MessageType } from '../../../src/lib/constants';
import { upgrade } from '../../../src/lib/user/upgradeUser';
import { decryptPGPKey } from '../../../src/lib/helpers';
import { createGroup, send } from '../../../src/lib/chat';
import { MessageWithCID, SignerType } from '../../../src/lib/types';
import { decryptAndVerifyMessage } from '../../../src/lib/chat/helpers';
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from 'unique-names-generator';
import {
  REACTION_SYMBOL,
  REACTION_TYPE,
} from '../../../src/lib/types/messageTypes';

chai.use(chaiAsPromised);
const _env = Constants.ENV.DEV;
describe('PushAPI.chat.send', () => {
  const provider = ethers.getDefaultProvider(5);
  let _signer1: any;
  let walletAddress1: string;
  let account1: string;
  let _signer2: any;
  let walletAddress2: string;
  let account2: string;
  const _nftSigner1 = new ethers.Wallet(
    `0x${process.env['NFT_HOLDER_WALLET_PRIVATE_KEY_1']}`,
    provider
  );
  const _nftAccount1 = `nft:eip155:${process.env['NFT_CHAIN_ID_1']}:${process.env['NFT_CONTRACT_ADDRESS_1']}:${process.env['NFT_TOKEN_ID_1']}`;
  const _nftSigner2 = new ethers.Wallet(
    `0x${process.env['NFT_HOLDER_WALLET_PRIVATE_KEY_2']}`,
    provider
  );
  const _nftAccount2 = `nft:eip155:${process.env['NFT_CHAIN_ID_2']}:${process.env['NFT_CONTRACT_ADDRESS_2']}:${process.env['NFT_TOKEN_ID_2']}`;

  const MESSAGE = 'Hey There!!!';
  const MESSAGE2 = 'Hey There Upgraded User!!!';

  beforeEach(() => {
    const WALLET1 = ethers.Wallet.createRandom();
    _signer1 = new ethers.Wallet(WALLET1.privateKey, provider);
    walletAddress1 = _signer1.address;
    account1 = `eip155:${walletAddress1}`;
    const WALLET2 = ethers.Wallet.createRandom();
    _signer2 = new ethers.Wallet(WALLET2.privateKey, provider);
    walletAddress2 = _signer2.address;
    account2 = `eip155:${walletAddress2}`;
  });

  describe('Sending message to different versioned Profile', () => {
    it('W2W Profile to NFT Profile', async () => {
      const msg = await send({
        messageContent: MESSAGE,
        receiverAddress: _nftAccount1,
        account: account1,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(msg, 'Text', MESSAGE, account1, _signer1, _nftAccount1);
    });
    it('NFT Profile to W2W Profile', async () => {
      const msg = await send({
        messageContent: MESSAGE,
        receiverAddress: account1,
        account: _nftAccount1,
        signer: _nftSigner1,
        env: _env,
      });
      await expectMsg(
        msg,
        'Text',
        MESSAGE,
        _nftAccount1,
        _nftSigner1,
        account1
      );
    });
    it('NFT Profile to NFT Profile', async () => {
      const msg = await send({
        messageContent: MESSAGE,
        receiverAddress: _nftAccount2,
        account: _nftAccount1,
        signer: _nftSigner1,
        env: _env,
      });
      await expectMsg(
        msg,
        'Text',
        MESSAGE,
        _nftAccount1,
        _nftSigner1,
        _nftAccount2
      );
    });
    it('v1 W2W Profile to v1 W2W Profile', async () => {
      await create({
        account: account1,
        env: _env,
        signer: _signer1,
        version: Constants.ENC_TYPE_V1,
      });
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
        version: Constants.ENC_TYPE_V1,
      });
      const msg = await send({
        messageContent: MESSAGE,
        receiverAddress: account2,
        account: account1,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        'Text',
        MESSAGE,
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
    it('v1 W2W Profile to v3 W2W Profile', async () => {
      await create({
        account: account1,
        env: _env,
        signer: _signer1,
        version: Constants.ENC_TYPE_V1,
      });
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
        version: Constants.ENC_TYPE_V3,
      });
      const msg = await send({
        messageContent: MESSAGE,
        receiverAddress: account2,
        account: account1,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        'Text',
        MESSAGE,
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
    it('v3 W2W Profile to v1 W2W Profile', async () => {
      await create({
        account: account1,
        env: _env,
        signer: _signer1,
        version: Constants.ENC_TYPE_V3,
      });
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
        version: Constants.ENC_TYPE_V1,
      });
      const msg = await send({
        messageContent: MESSAGE,
        receiverAddress: account2,
        account: account1,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        'Text',
        MESSAGE,
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
    it('v3 W2W Profile to v3 W2W Profile', async () => {
      await create({
        account: account1,
        env: _env,
        signer: _signer1,
      });
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
      });
      const msg = await send({
        messageContent: MESSAGE,
        receiverAddress: account2,
        account: account1,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        'Text',
        MESSAGE,
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
    it('v1 W2W Profile to v1 W2W Profile(upgraded to v3 in between)', async () => {
      await create({
        account: account1,
        env: _env,
        signer: _signer1,
        version: Constants.ENC_TYPE_V1,
      });
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
        version: Constants.ENC_TYPE_V1,
      });
      const msg = await send({
        messageContent: MESSAGE,
        receiverAddress: account2,
        account: account1,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        'Text',
        MESSAGE,
        account1,
        _signer1,
        account2,
        'pgp'
      );
      await upgrade({
        account: account2,
        env: _env,
        signer: _signer2,
      });
      // able to depcrypt after upgrade
      await expectMsg(
        msg,
        'Text',
        MESSAGE,
        account1,
        _signer1,
        account2,
        'pgp'
      );
      // able to decrypt new messages post upgrade
      const msg2 = await send({
        messageContent: MESSAGE2,
        receiverAddress: account2,
        account: account1,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg2,
        'Text',
        MESSAGE2,
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
    it('v1 W2W Profile(upgraded to v3 in between) to v1 W2W Profile', async () => {
      await create({
        account: account1,
        env: _env,
        signer: _signer1,
        version: Constants.ENC_TYPE_V1,
      });
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
        version: Constants.ENC_TYPE_V1,
      });
      const msg = await send({
        messageContent: MESSAGE,
        receiverAddress: account2,
        account: account1,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        'Text',
        MESSAGE,
        account1,
        _signer1,
        account2,
        'pgp'
      );
      await upgrade({
        account: account1,
        env: _env,
        signer: _signer1,
      });
      // able to depcrypt after upgrade
      await expectMsg(
        msg,
        'Text',
        MESSAGE,
        account1,
        _signer1,
        account2,
        'pgp'
      );
      // able to decrypt new messages post upgrade
      const msg2 = await send({
        messageContent: MESSAGE2,
        receiverAddress: account2,
        account: account1,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg2,
        'Text',
        MESSAGE2,
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
  });
  describe('Text Message', () => {
    const MESSAGE_TYPE = MessageType.TEXT;
    const MESSAGE = 'hey There!!!';
    it('should throw error using action or info', async () => {
      await expect(
        send({
          messageType: MESSAGE_TYPE,
          messageObj: {
            content: MESSAGE,
            action: 1,
            info: { affected: [] },
          },
          receiverAddress: account2,
          signer: _signer1,
          env: _env,
        })
      ).to.be.rejected;
    });
    it('Depreacted V1 | EncType - PlainText', async () => {
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageContent: MESSAGE,
        receiverAddress: account2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        MESSAGE,
        account1,
        _signer1,
        account2,
        'PlainText'
      );
    });
    it('Deprecated V1 | EncType - pgp', async () => {
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
        version: Constants.ENC_TYPE_V1,
      });
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageContent: MESSAGE,
        receiverAddress: account2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        MESSAGE,
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
    it('Deprecated V2 | EncType - Plaintext', async () => {
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageObj: { content: MESSAGE },
        receiverAddress: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        MESSAGE,
        account1,
        _signer1,
        account2,
        'PlainText'
      );
    });
    it('Deprecated V2 | EncType - pgp', async () => {
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
        version: Constants.ENC_TYPE_V1,
      });
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageObj: { content: MESSAGE },
        receiverAddress: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        MESSAGE,
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
    it('V3 | EncType - Plaintext', async () => {
      const msg = await send({
        message: { type: MESSAGE_TYPE, content: MESSAGE },
        to: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        { content: MESSAGE },
        account1,
        _signer1,
        account2,
        'PlainText'
      );
    });
    it('V3 | EncType - pgp', async () => {
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
        version: Constants.ENC_TYPE_V1,
      });
      const msg = await send({
        message: { type: MESSAGE_TYPE, content: MESSAGE },
        to: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        { content: MESSAGE },
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
  });
  describe('Image Message', () => {
    const MESSAGE_TYPE = MessageType.IMAGE;
    const MESSAGE =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAvklEQVR4AcXBsW2FMBiF0Y8r3GQb6jeBxRauYRpo4yGQkMd4gg==';
    it('should throw error using wrong messageObj', async () => {
      await expect(
        send({
          messageType: MESSAGE_TYPE,
          messageObj: {
            content: MESSAGE,
            action: 1,
            info: { affected: [] },
          },
          receiverAddress: account2,
          signer: _signer1,
          env: _env,
        })
      ).to.be.rejected;
    });
    it('Depreacted V1 | EncType - PlainText', async () => {
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageContent: MESSAGE,
        receiverAddress: account2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        MESSAGE,
        account1,
        _signer1,
        account2,
        'PlainText'
      );
    });
    it('Deprecated V1 | EncType - pgp', async () => {
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
        version: Constants.ENC_TYPE_V1,
      });
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageContent: MESSAGE,
        receiverAddress: account2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        MESSAGE,
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
    it('Deprecated V2 | EncType - Plaintext', async () => {
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageObj: { content: MESSAGE },
        receiverAddress: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        MESSAGE,
        account1,
        _signer1,
        account2,
        'PlainText'
      );
    });
    it('Deprecated V2 | EncType - pgp', async () => {
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
        version: Constants.ENC_TYPE_V1,
      });
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageObj: { content: MESSAGE },
        receiverAddress: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        MESSAGE,
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
    it('V3 | EncType - Plaintext', async () => {
      const msg = await send({
        message: { type: MESSAGE_TYPE, content: MESSAGE },
        to: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        { content: MESSAGE },
        account1,
        _signer1,
        account2,
        'PlainText'
      );
    });
    it('V3 | EncType - pgp', async () => {
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
        version: Constants.ENC_TYPE_V1,
      });
      const msg = await send({
        message: { type: MESSAGE_TYPE, content: MESSAGE },
        receiverAddress: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        { content: MESSAGE },
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
  });
  describe('File Message', () => {
    const MESSAGE_TYPE = MessageType.FILE;
    const MESSAGE = '{"content":"data:application/pdf;base64,JVBERi0xLjQKJ}';
    it('should throw error using wrong messageObj', async () => {
      await expect(
        send({
          messageType: MESSAGE_TYPE,
          messageObj: {
            content: MESSAGE,
            action: 1,
            info: { affected: [] },
          },
          receiverAddress: account2,
          signer: _signer1,
          env: _env,
        })
      ).to.be.rejected;
    });
    it('Depreacted V1 | EncType - PlainText', async () => {
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageContent: MESSAGE,
        receiverAddress: account2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        MESSAGE,
        account1,
        _signer1,
        account2,
        'PlainText'
      );
    });
    it('Deprecated V1 | EncType - pgp', async () => {
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
        version: Constants.ENC_TYPE_V1,
      });
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageContent: MESSAGE,
        receiverAddress: account2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        MESSAGE,
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
    it('Deprecated V2 | EncType - Plaintext', async () => {
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageObj: { content: MESSAGE },
        receiverAddress: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        MESSAGE,
        account1,
        _signer1,
        account2,
        'PlainText'
      );
    });
    it('Deprecated V2 | EncType - pgp', async () => {
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
        version: Constants.ENC_TYPE_V1,
      });
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageObj: { content: MESSAGE },
        receiverAddress: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        MESSAGE,
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
    it('V3 | EncType - Plaintext', async () => {
      const msg = await send({
        message: { type: MESSAGE_TYPE, content: MESSAGE },
        to: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        { content: MESSAGE },
        account1,
        _signer1,
        account2,
        'PlainText'
      );
    });
    it('V3 | EncType - pgp', async () => {
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
        version: Constants.ENC_TYPE_V1,
      });
      const msg = await send({
        message: { type: MESSAGE_TYPE, content: MESSAGE },
        to: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        { content: MESSAGE },
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
  });
  describe('MediaEmbed Message', () => {
    const MESSAGE_TYPE = MessageType.MEDIA_EMBED;
    const MESSAGE =
      'ttps://media1.giphy.com/media/FtlUfrq3pVZXVNjoxf/giphy360p.mp4?cid=ecf05e47jk317254v9hbdjrknemduocie4pf54wtsir98xsx&ep=v1_videos_search&rid=giphy360p.mp4&ct=v';
    it('should throw error using wrong messageObj', async () => {
      await expect(
        send({
          messageType: MESSAGE_TYPE,
          messageObj: {
            content: MESSAGE,
            action: 1,
            info: { affected: [] },
          },
          receiverAddress: account2,
          signer: _signer1,
          env: _env,
        })
      ).to.be.rejected;
    });
    it('Depreacted V1 | EncType - PlainText', async () => {
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageContent: MESSAGE,
        receiverAddress: account2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        MESSAGE,
        account1,
        _signer1,
        account2,
        'PlainText'
      );
    });
    it('Deprecated V1 | EncType - pgp', async () => {
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
        version: Constants.ENC_TYPE_V1,
      });
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageContent: MESSAGE,
        receiverAddress: account2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        MESSAGE,
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
    it('Deprecated V2 | EncType - Plaintext', async () => {
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageObj: { content: MESSAGE },
        receiverAddress: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        MESSAGE,
        account1,
        _signer1,
        account2,
        'PlainText'
      );
    });
    it('Deprecated V2 | EncType - pgp', async () => {
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
        version: Constants.ENC_TYPE_V1,
      });
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageObj: { content: MESSAGE },
        receiverAddress: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        MESSAGE,
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
    it('V3 | EncType - Plaintext', async () => {
      const msg = await send({
        message: { type: MESSAGE_TYPE, content: MESSAGE },
        to: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        { content: MESSAGE },
        account1,
        _signer1,
        account2,
        'PlainText'
      );
    });
    it('V3 | EncType - pgp', async () => {
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
        version: Constants.ENC_TYPE_V1,
      });
      const msg = await send({
        message: { type: MESSAGE_TYPE, content: MESSAGE },
        to: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        { content: MESSAGE },
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
  });
  describe('GIF Message', () => {
    const MESSAGE_TYPE = MessageType.GIF;
    const MESSAGE =
      'ttps://media1.giphy.com/media/FtlUfrq3pVZXVNjoxf/giphy360p.mp4?cid=ecf05e47jk317254v9hbdjrknemduocie4pf54wtsir98xsx&ep=v1_videos_search&rid=giphy360p.mp4&ct=v';
    it('should throw error using wrong messageObj', async () => {
      await expect(
        send({
          messageType: MESSAGE_TYPE,
          messageObj: {
            content: MESSAGE,
            action: 1,
            info: { affected: [] },
          },
          receiverAddress: account2,
          signer: _signer1,
          env: _env,
        })
      ).to.be.rejected;
    });
    it('Depreacted V1 | EncType - PlainText', async () => {
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageContent: MESSAGE,
        receiverAddress: account2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        MESSAGE,
        account1,
        _signer1,
        account2,
        'PlainText'
      );
    });
    it('Deprecated V1 | EncType - pgp', async () => {
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
        version: Constants.ENC_TYPE_V1,
      });
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageContent: MESSAGE,
        receiverAddress: account2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        MESSAGE,
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
    it('Deprecated V2 | EncType - Plaintext', async () => {
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageObj: { content: MESSAGE },
        receiverAddress: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        MESSAGE,
        account1,
        _signer1,
        account2,
        'PlainText'
      );
    });
    it('Deprecated V2 | EncType - pgp', async () => {
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
        version: Constants.ENC_TYPE_V1,
      });
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageObj: { content: MESSAGE },
        receiverAddress: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        MESSAGE,
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
    it('V3 | EncType - Plaintext', async () => {
      const msg = await send({
        message: { type: MESSAGE_TYPE, content: MESSAGE },
        to: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        { content: MESSAGE },
        account1,
        _signer1,
        account2,
        'PlainText'
      );
    });
    it('V3 | EncType - pgp', async () => {
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
        version: Constants.ENC_TYPE_V1,
      });
      const msg = await send({
        message: { type: MESSAGE_TYPE, content: MESSAGE },
        to: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        { content: MESSAGE },
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
  });
  describe('Meta Message', () => {
    const MESSAGE_TYPE = MessageType.META;
    const MESSAGE = 'xyz created group PUSH';
    it('should throw error using messageContent or wrong MessageObject', async () => {
      await expect(
        send({
          messageType: MESSAGE_TYPE,
          messageContent: MESSAGE,
          receiverAddress: account2,
          signer: _signer1,
          env: _env,
        })
      ).to.be.rejected;
      await expect(
        send({
          messageType: MESSAGE_TYPE,
          messageObj: { content: MESSAGE },
          messageContent: MESSAGE,
          receiverAddress: account2,
          signer: _signer1,
          env: _env,
        })
      ).to.be.rejected;
      await expect(
        send({
          messageType: MESSAGE_TYPE,
          messageObj: { content: MESSAGE, reference: '' },
          messageContent: MESSAGE,
          receiverAddress: account2,
          signer: _signer1,
          env: _env,
        })
      ).to.be.rejected;
      await expect(
        send({
          messageType: MESSAGE_TYPE,
          messageObj: { content: MESSAGE, action: 1 }, // no info provided
          messageContent: MESSAGE,
          receiverAddress: account2,
          signer: _signer1,
          env: _env,
        })
      ).to.be.rejected;
    });
    it('should throw error for non-group', async () => {
      await expect(
        send({
          messageType: MESSAGE_TYPE,
          messageObj: {
            content: MESSAGE,
            action: 1,
            info: { affected: [] },
          },
          receiverAddress: account2,
          signer: _signer1,
          env: _env,
        })
      ).to.be.rejected;
    });
    it('should throw error for non member of group', async () => {
      const groupName = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
      });
      const groupDescription = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
      });
      const groupImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAvklEQVR4AcXBsW2FMBiF0Y8r3GQb6jeBxRauYRpo4yGQkMd4A7kg7Z/GUfSKe8703fKDkTATZsJsrr0RlZSJ9r4RLayMvLmJjnQS1d6IhJkwE2bT13U/DBzp5BN73xgRZsJMmM1HOolqb/yWiWpvjJSUiRZWopIykTATZsJs5g+1N6KSMiO1N/5DmAkzYTa9Lh6MhJkwE2ZzSZlo7xvRwson3txERzqJhJkwE2bT6+JhoKTMJ2pvjAgzYSbMfgDlXixqjH6gRgAAAABJRU5ErkJggg==';

      const group = await createGroup({
        groupName,
        groupDescription,
        members: [_nftAccount1, _nftAccount2],
        groupImage,
        admins: [], // takes signer as admin automatically, add more if you want to
        isPublic: true,
        signer: _signer1,
        env: _env,
      });
      await expect(
        send({
          messageType: MESSAGE_TYPE,
          messageObj: {
            content: MESSAGE,
            action: 1,
            info: { affected: [] },
          },
          receiverAddress: group.chatId,
          signer: _signer2,
          env: _env,
        })
      ).to.be.rejected;
    });
    it('should throw error for Non-Admin member of group', async () => {
      const groupName = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
      });
      const groupDescription = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
      });
      const groupImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAvklEQVR4AcXBsW2FMBiF0Y8r3GQb6jeBxRauYRpo4yGQkMd4A7kg7Z/GUfSKe8703fKDkTATZsJsrr0RlZSJ9r4RLayMvLmJjnQS1d6IhJkwE2bT13U/DBzp5BN73xgRZsJMmM1HOolqb/yWiWpvjJSUiRZWopIykTATZsJs5g+1N6KSMiO1N/5DmAkzYTa9Lh6MhJkwE2ZzSZlo7xvRwson3txERzqJhJkwE2bT6+JhoKTMJ2pvjAgzYSbMfgDlXixqjH6gRgAAAABJRU5ErkJggg==';

      const group = await createGroup({
        groupName,
        groupDescription,
        members: [_nftAccount1, _nftAccount2, account2],
        groupImage,
        admins: [], // takes signer as admin automatically, add more if you want to
        isPublic: true,
        signer: _signer1,
        env: _env,
      });
      await expect(
        send({
          messageType: MESSAGE_TYPE,
          messageObj: {
            content: MESSAGE,
            action: 1,
            info: { affected: [] },
          },
          receiverAddress: group.chatId,
          signer: _signer2,
          env: _env,
        })
      ).to.be.rejected;
    });
    it('Deprecated V1 | EncType - PlainText ( Public Grp )', async () => {
      const groupName = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
      });
      const groupDescription = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
      });
      const groupImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAvklEQVR4AcXBsW2FMBiF0Y8r3GQb6jeBxRauYRpo4yGQkMd4A7kg7Z/GUfSKe8703fKDkTATZsJsrr0RlZSJ9r4RLayMvLmJjnQS1d6IhJkwE2bT13U/DBzp5BN73xgRZsJMmM1HOolqb/yWiWpvjJSUiRZWopIykTATZsJs5g+1N6KSMiO1N/5DmAkzYTa9Lh6MhJkwE2ZzSZlo7xvRwson3txERzqJhJkwE2bT6+JhoKTMJ2pvjAgzYSbMfgDlXixqjH6gRgAAAABJRU5ErkJggg==';

      const group = await createGroup({
        groupName,
        groupDescription,
        members: [_nftAccount1, _nftAccount2, account2],
        groupImage,
        admins: [], // takes signer as admin automatically, add more if you want to
        isPublic: true,
        signer: _signer1,
        env: _env,
      });
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageObj: {
          content: MESSAGE,
          action: 1,
          info: { affected: [] },
        },
        receiverAddress: group.chatId,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        { content: MESSAGE, action: 1, info: { affected: [] } },
        account1,
        _signer1,
        group.chatId,
        'PlainText'
      );
    });
    it('Deprecated V1 | EncType - pgp ( Private Grp )', async () => {
      const groupName = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
      });
      const groupDescription = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
      });
      const groupImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAvklEQVR4AcXBsW2FMBiF0Y8r3GQb6jeBxRauYRpo4yGQkMd4A7kg7Z/GUfSKe8703fKDkTATZsJsrr0RlZSJ9r4RLayMvLmJjnQS1d6IhJkwE2bT13U/DBzp5BN73xgRZsJMmM1HOolqb/yWiWpvjJSUiRZWopIykTATZsJs5g+1N6KSMiO1N/5DmAkzYTa9Lh6MhJkwE2ZzSZlo7xvRwson3txERzqJhJkwE2bT6+JhoKTMJ2pvjAgzYSbMfgDlXixqjH6gRgAAAABJRU5ErkJggg==';

      const group = await createGroup({
        groupName,
        groupDescription,
        members: [_nftAccount1, _nftAccount2, account2],
        groupImage,
        admins: [], // takes signer as admin automatically, add more if you want to
        isPublic: false,
        signer: _signer1,
        env: _env,
      });
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageObj: {
          content: MESSAGE,
          action: 1,
          info: { affected: [] },
        },
        receiverAddress: group.chatId,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        { content: MESSAGE, action: 1, info: { affected: [] } },
        account1,
        _signer1,
        group.chatId,
        'pgp'
      );
    });
    it('V2 | EncType - PlainText ( Public Grp )', async () => {
      const groupName = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
      });
      const groupDescription = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
      });
      const groupImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAvklEQVR4AcXBsW2FMBiF0Y8r3GQb6jeBxRauYRpo4yGQkMd4A7kg7Z/GUfSKe8703fKDkTATZsJsrr0RlZSJ9r4RLayMvLmJjnQS1d6IhJkwE2bT13U/DBzp5BN73xgRZsJMmM1HOolqb/yWiWpvjJSUiRZWopIykTATZsJs5g+1N6KSMiO1N/5DmAkzYTa9Lh6MhJkwE2ZzSZlo7xvRwson3txERzqJhJkwE2bT6+JhoKTMJ2pvjAgzYSbMfgDlXixqjH6gRgAAAABJRU5ErkJggg==';

      const group = await createGroup({
        groupName,
        groupDescription,
        members: [_nftAccount1, _nftAccount2, account2],
        groupImage,
        admins: [], // takes signer as admin automatically, add more if you want to
        isPublic: true,
        signer: _signer1,
        env: _env,
      });
      const msg = await send({
        message: {
          type: MESSAGE_TYPE,
          content: MESSAGE,
          action: 1,
          info: { affected: [] },
        },
        to: group.chatId,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        { content: MESSAGE, action: 1, info: { affected: [] } },
        account1,
        _signer1,
        group.chatId,
        'PlainText'
      );
    });
    it('V2 | EncType - pgp ( Private Grp )', async () => {
      const groupName = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
      });
      const groupDescription = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
      });
      const groupImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAvklEQVR4AcXBsW2FMBiF0Y8r3GQb6jeBxRauYRpo4yGQkMd4A7kg7Z/GUfSKe8703fKDkTATZsJsrr0RlZSJ9r4RLayMvLmJjnQS1d6IhJkwE2bT13U/DBzp5BN73xgRZsJMmM1HOolqb/yWiWpvjJSUiRZWopIykTATZsJs5g+1N6KSMiO1N/5DmAkzYTa9Lh6MhJkwE2ZzSZlo7xvRwson3txERzqJhJkwE2bT6+JhoKTMJ2pvjAgzYSbMfgDlXixqjH6gRgAAAABJRU5ErkJggg==';

      const group = await createGroup({
        groupName,
        groupDescription,
        members: [_nftAccount1, _nftAccount2, account2],
        groupImage,
        admins: [], // takes signer as admin automatically, add more if you want to
        isPublic: false,
        signer: _signer1,
        env: _env,
      });
      const msg = await send({
        message: {
          type: MESSAGE_TYPE,
          content: MESSAGE,
          action: 1,
          info: { affected: [] },
        },
        to: group.chatId,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        { content: MESSAGE, action: 1, info: { affected: [] } },
        account1,
        _signer1,
        group.chatId,
        'pgp'
      );
    });
  });
  describe('Reaction Message', () => {
    const MESSAGE_TYPE = MessageType.REACTION;
    const MESSAGE = '';
    it('should throw error using messageContent or wrong MessageObject', async () => {
      await expect(
        send({
          messageType: MESSAGE_TYPE,
          messageContent: MESSAGE,
          receiverAddress: account2,
          signer: _signer1,
          env: _env,
        })
      ).to.be.rejected;
      await expect(
        send({
          messageType: MESSAGE_TYPE,
          messageObj: { content: MESSAGE },
          messageContent: MESSAGE,
          receiverAddress: account2,
          signer: _signer1,
          env: _env,
        })
      ).to.be.rejected;
      await expect(
        send({
          messageType: MESSAGE_TYPE,
          messageObj: { content: MESSAGE, info: { affected: [] } },
          messageContent: MESSAGE,
          receiverAddress: account2,
          signer: _signer1,
          env: _env,
        })
      ).to.be.rejected;
    });
    it('Deprecated V1 | EncType - PlainText', async () => {
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageObj: {
          content: MESSAGE,
          action: REACTION_TYPE.THUMBS_UP,
        },
        receiverAddress: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        {
          content: REACTION_SYMBOL[REACTION_TYPE.THUMBS_UP], // REACTION OVERRIDES THE MESSAGE CONTENT TO THE SYMBOL,
          action: REACTION_TYPE.THUMBS_UP,
        },
        account1,
        _signer1,
        account2,
        'PlainText'
      );
    });
    it('Deprecated V1 | EncType - pgp', async () => {
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
      });
      const msg = await send({
        messageType: MESSAGE_TYPE,
        messageObj: {
          content: MESSAGE,
          action: REACTION_TYPE.THUMBS_UP,
        },
        receiverAddress: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        {
          content: REACTION_SYMBOL[REACTION_TYPE.THUMBS_UP], // REACTION OVERRIDES THE MESSAGE CONTENT TO THE SYMBOL
          action: REACTION_TYPE.THUMBS_UP,
        },
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
    it('V2 | EncType - PlainText', async () => {
      const msg = await send({
        message: {
          type: MESSAGE_TYPE,
          content: MESSAGE,
          action: REACTION_TYPE.THUMBS_UP,
        },
        to: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        {
          content: REACTION_SYMBOL[REACTION_TYPE.THUMBS_UP], // REACTION OVERRIDES THE MESSAGE CONTENT TO THE SYMBOL,
          action: REACTION_TYPE.THUMBS_UP,
        },
        account1,
        _signer1,
        account2,
        'PlainText'
      );
    });
    it('V2 | EncType - pgp', async () => {
      await create({
        account: account2,
        env: _env,
        signer: _signer2,
      });
      const msg = await send({
        message: {
          type: MESSAGE_TYPE,
          content: MESSAGE,
          action: REACTION_TYPE.THUMBS_UP,
        },
        to: walletAddress2,
        signer: _signer1,
        env: _env,
      });
      await expectMsg(
        msg,
        MESSAGE_TYPE,
        {
          content: REACTION_SYMBOL[REACTION_TYPE.THUMBS_UP], // REACTION OVERRIDES THE MESSAGE CONTENT TO THE SYMBOL
          action: REACTION_TYPE.THUMBS_UP,
        },
        account1,
        _signer1,
        account2,
        'pgp'
      );
    });
  });
});

/**
 * HELPER FUNCTION
 */
const expectMsg = async (
  msg: MessageWithCID,
  messageType: string,
  content: string | { [key: string]: any },
  sender: string,
  senderSigner: SignerType, // or receiverSigner
  receiver: string,
  encType?: 'PlainText' | 'pgp'
): Promise<void> => {
  expect(msg.fromDID).to.include(sender);
  expect(msg.fromCAIP10).to.include(sender);
  expect(msg.toDID).to.include(receiver);
  expect(msg.toCAIP10).to.include(receiver);
  expect(msg.messageType).to.equal(messageType);
  expect(msg.verificationProof?.split(':')[0]).to.be.oneOf(['pgpv2', 'pgp']);
  //Backward Compatibility check
  expect(msg.sigType).to.equal(msg.verificationProof?.split(':')[0]);
  //Backward Compatibility check ( signature signs messageContent and will be diff from vProof )
  expect(msg.signature).not.to.equal(msg.verificationProof?.split(':')[1]);
  try {
    if (encType && encType === 'pgp') {
      throw new Error('Should be encrypted');
    }
    expect(msg.encType).to.equal('PlainText');
    expect(msg.encryptedSecret).to.equal('');
    if (typeof content === 'string') {
      expect((msg.messageObj as { content: string }).content).to.equal(content);
      //Backward Compatibility check
      expect(msg.messageContent).to.equal(content);
    } else {
      expect(msg.messageObj).to.eql(content);
      //Backward Compatibility check
      expect(msg.messageContent).to.equal((content as any).content);
    }
  } catch (err) {
    if (encType && encType === 'PlainText') {
      throw new Error('Should be PlainText');
    }

    expect(msg.encType).to.equal('pgp');
    expect(msg.encryptedSecret).not.to.equal('');
    // Decrypt Message
    const senderProfile = await get({ account: sender, env: _env });
    const senderPGPPrivateKey = await decryptPGPKey({
      encryptedPGPPrivateKey: senderProfile.encryptedPrivateKey,
      signer: senderSigner, // or receiverSigner
      env: _env,
    });
    const decryptedMsg = await decryptAndVerifyMessage(
      msg,
      senderProfile.publicKey,
      senderPGPPrivateKey
    );
    if (typeof content === 'string') {
      expect((decryptedMsg.messageObj as { content: string }).content).to.equal(
        content
      );
      //Backward Compatibility check
      expect(decryptedMsg.messageContent).to.equal(content);
    } else {
      expect(decryptedMsg.messageObj).to.eql(content);
      //Backward Compatibility check
      expect(decryptedMsg.messageContent).to.equal((content as any).content);
    }
  }
};
