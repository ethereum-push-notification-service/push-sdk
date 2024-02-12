import { expect } from 'chai';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import { sendNotification } from '../../../src/lib/payloads/sendNotifications';
import * as testData from './testData';
import { ENV } from '../../../src/lib/constants';
import { getFeeds } from '../../../src/lib/user';
import { decryptFeed } from '../../../src/lib/utils/decryptFeed';
import { decryptPGPKey } from '../../../src/lib/helpers';
import { get } from '../../../src/lib/user/getUser';
import { Lit } from '../../../src/lib/payloads/litHelper';
describe('sendNotifications', () => {
  let signer1: any;
  let account1: any;
  let recipientSigner: any;
  let recipientAccount: any;
  beforeEach(async () => {
    signer1 = new ethers.Wallet(`0x${process.env['WALLET_PRIVATE_KEY']}`);
    account1 = await signer1.getAddress();
    recipientSigner = new ethers.Wallet(
      `0x${process.env['WALLET_RECIPIENT_PK']}`
    );
    recipientAccount = await recipientSigner.getAddress();
  });
  describe('sendNotification', async () => {
    it('Should send pgp encrypted notification for targetted recipient', async () => {
      const res = await sendNotification({
        ...testData.TEST_ENC_RAW_PAYLOAD,
        recipients: testData.TARGETED_RECIPIENT,
        env: ENV.DEV,
        signer: signer1
      });
      expect(res.status).to.equal(204);
      const userInfo = await get({
        account: testData.TARGETED_RECIPIENT,
        env: ENV.DEV
      });
      const decryptedPGPPrivateKey = await decryptPGPKey({
        encryptedPGPPrivateKey: userInfo.encryptedPrivateKey,
        account: recipientAccount,
        signer: recipientSigner,
        env: ENV.DEV
      });
      const feeds = await getFeeds({
        user: testData.TARGETED_RECIPIENT,
        env: ENV.DEV,
        pgpPrivateKey: decryptedPGPPrivateKey
      });
      console.log(feeds);
    });

    it('Should send lit encrypted notification for targetted recipient', async () => {
      const res = await sendNotification({
        ...testData.TEST_ENC_LIT_RAW_PAYLOAD,
        recipients: testData.TARGETED_RECIPIENT,
        env: ENV.DEV,
        signer: signer1
      });
      expect(res.status).to.equal(204);
      const userInfo = await get({
        account: testData.TARGETED_RECIPIENT,
        env: ENV.DEV
      });
      const decryptedPGPPrivateKey = await decryptPGPKey({
        encryptedPGPPrivateKey: userInfo.encryptedPrivateKey,
        account: recipientAccount,
        signer: recipientSigner,
        env: ENV.DEV
      });
      const lit = new Lit(recipientSigner);
      await lit.connect();
      const feeds = await getFeeds({
        user: testData.TARGETED_RECIPIENT,
        // raw: true,
        env: ENV.DEV,
        pgpPrivateKey: decryptedPGPPrivateKey,
        lit: lit
      });
      console.log(feeds);
    });

    it('Should send pgp encrypted notification for subset recipients', async () => {
      const res = await sendNotification({
        ...testData.TEST_ENC_SUBSET_RAW_PAYLOAD,
        recipients: testData.SUBSET_RECIPIENT,
        env: ENV.DEV,
        signer: signer1
      });
      const userInfo = await get({
        account: testData.SUBSET_RECIPIENT[1],
        env: ENV.DEV
      });
      const decryptedPGPPrivateKey = await decryptPGPKey({
        encryptedPGPPrivateKey: userInfo.encryptedPrivateKey,
        account: recipientAccount,
        signer: recipientSigner,
        env: ENV.DEV
      });
      // console.log(decryptedPGPPrivateKey)
      const lit = new Lit(recipientSigner)
      await lit.connect()
      expect(res.status).to.equal(204);
      const userfeeds1 = await getFeeds({
        user: testData.SUBSET_RECIPIENT[1],
        env: ENV.DEV,
        lit,
        pgpPrivateKey: decryptedPGPPrivateKey
      });
      console.log(testData.SUBSET_RECIPIENT[1]);
      console.log(userfeeds1);
    });

    it('Should send lit encrypted notification for subset recipients', async () => {
      const res = await sendNotification({
        ...testData.TEST_LIT_ENC_SUBSET_RAW_PAYLOAD,
        recipients: testData.SUBSET_RECIPIENT,
        env: ENV.DEV,
        signer: signer1
      });
      const userInfo = await get({
        account: testData.SUBSET_RECIPIENT[1],
        env: ENV.DEV
      });
      const decryptedPGPPrivateKey = await decryptPGPKey({
        encryptedPGPPrivateKey: userInfo.encryptedPrivateKey,
        account: recipientAccount,
        signer: recipientSigner,
        env: ENV.DEV
      });
      // console.log(decryptedPGPPrivateKey)
      const lit = new Lit(recipientSigner);
      await lit.connect();
      expect(res.status).to.equal(204);
      const userfeeds1 = await getFeeds({
        user: testData.SUBSET_RECIPIENT[1],
        env: ENV.DEV,
        lit,
        pgpPrivateKey: decryptedPGPPrivateKey
      });
      console.log(userfeeds1);
    });

    it('Should send pgp encrypted notification for broadcast recipients', async () => {
      const res = await sendNotification({
        ...testData.TEST_ENC_BROADCAST_RAW_PAYLOAD,
        env: ENV.DEV,
        signer: signer1
      });
      expect(res.status).to.equal(204);
      const userInfo = await get({
        account: testData.SUBSET_RECIPIENT[1],
        env: ENV.DEV
      });
      const decryptedPGPPrivateKey = await decryptPGPKey({
        encryptedPGPPrivateKey: userInfo.encryptedPrivateKey,
        account: recipientAccount,
        signer: recipientSigner,
        env: ENV.DEV
      });
      const lit = new Lit(recipientSigner);
      await lit.connect();
      const userfeeds1 = await getFeeds({
        user: testData.SUBSET_RECIPIENT[1],
        env: ENV.DEV,
        pgpPrivateKey: decryptedPGPPrivateKey,
        lit
      });
      console.log(userfeeds1);
    });

    it('Should send lit encrypted notification for broadcast recipients', async () => {
      const res = await sendNotification({
        ...testData.TEST_ENC_LIT_BROADCAST_RAW_PAYLOAD,
        env: ENV.DEV,
        signer: signer1
      });
      expect(res.status).to.equal(204);
      const userInfo = await get({
        account: testData.SUBSET_RECIPIENT[1],
        env: ENV.DEV
      });
      const decryptedPGPPrivateKey = await decryptPGPKey({
        encryptedPGPPrivateKey: userInfo.encryptedPrivateKey,
        account: recipientAccount,
        signer: recipientSigner,
        env: ENV.DEV
      });
      const lit = new Lit(signer1);
      await lit.connect();
      const userfeeds1 = await getFeeds({
        user: testData.SUBSET_RECIPIENT[1],
        env: ENV.DEV,
        pgpPrivateKey: decryptedPGPPrivateKey,
        lit: lit
      });
      console.log(userfeeds1);
    });

    it('Should send pk encrypted targetted notification', async () => {
      const res = await sendNotification({
        ...testData.TEST_ENC_RAW_PAYLOAD,
        recipients: testData.TEST_PK_ENC_RECIPIENT,
        env: ENV.DEV,
        signer: signer1
      });
      console.log(res.status);
    });

    it('Should send delegate notification', async () => {
      const res = await sendNotification({
        ...testData.TEST_ENC_RAW_PAYLOAD,
        recipients: testData.TARGETED_RECIPIENT,
        env: ENV.DEV,
        signer: signer1,
        channel: 'eip155:11155111:0xD8634C39BBFd4033c0d3289C4515275102423681'
      });
      console.log(res.status);
    });
  });

  describe('decrypt encrypted feed', async () => {
    it('Should decrypt targetted feed', async () => {
      const userInfo = await get({
        account: testData.TARGETED_RECIPIENT,
        env: ENV.DEV
      });
      const decryptedPGPPrivateKey = await decryptPGPKey({
        encryptedPGPPrivateKey: userInfo.encryptedPrivateKey,
        account: account1,
        signer: signer1,
        env: ENV.DEV
      });

      // const decryptedFeed = await decryptFeed({
      //   feed: testData.TEST_PGP_ENCRYPTED_FEED,
      //   pgpPrivateKey: decryptedPGPPrivateKey
      // })
      // console.log(decryptedFeed)
    });

    // it.skip('Should decrypt lit feed', async () => {
    //   const lit = new Lit(recipientSigner);
    //   const decryptedFeed = await decryptFeed({
    //     feed: testData.TEST_LIT_ENCRYPTED_FEED,
    //     lit: lit
    //   })

    //   console.log(decryptedFeed)
    // });
  });
});
