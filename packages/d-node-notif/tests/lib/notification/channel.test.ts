import { PushAPI } from '../../../src/lib/pushAPI/PushAPI';
import { expect } from 'chai';
import { ethers } from 'ethers';
import { sepolia } from 'viem/chains';
import {
  createWalletClient,
  http,
  getContract,
  createPublicClient,
} from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import CONSTANTS from '../../../src/lib/constants';
import { inspect } from 'util';
import { ENV } from '../../../src/lib/constants';

describe('PushAPI.channel functionality', () => {
  let userAlice: PushAPI;
  let userBob: PushAPI;
  let userKate: PushAPI;
  let signer1: any;
  let account1: string;
  let signer2: any;
  let account2: string;
  let userNoChannel: PushAPI;
  let noChannelSigner: any;
  let noChannelAddress: string;
  let viemUser: any;
  let viemSigner: any;

  beforeEach(async () => {
    signer1 = new ethers.Wallet(`0x${process.env['WALLET_PRIVATE_KEY']}`);
    account1 = await signer1.getAddress();

    const provider = (ethers as any).providers
      ? new (ethers as any).providers.JsonRpcProvider('https://rpc.sepolia.org')
      : new (ethers as any).JsonRpcProvider('https://rpc.sepolia.org');

    signer2 = new ethers.Wallet(
      `0x${process.env['WALLET_PRIVATE_KEY']}`,
      provider
    );
    account2 = await signer2.getAddress();

    const WALLET = ethers.Wallet.createRandom();
    noChannelSigner = new ethers.Wallet(WALLET.privateKey);
    noChannelAddress = await noChannelSigner.getAddress();
    viemSigner = createWalletClient({
      account: privateKeyToAccount(`0x${process.env['WALLET_PRIVATE_KEY']}`),
      chain: sepolia,
      transport: http(),
    });

    // accessing env dynamically using process.env
    type EnvStrings = keyof typeof ENV;
    const envMode = process.env.ENV as EnvStrings;
    const _env = ENV[envMode];

    // initialisation with signer and provider
    userKate = await PushAPI.initialize(signer2, { env: _env });
    // initialisation with signer
    userAlice = await PushAPI.initialize(signer2, { env: _env });
    // TODO: remove signer1 after chat makes signer as optional
    //initialisation without signer
    userBob = await PushAPI.initialize(signer1, { env: _env });
    // initialisation with a signer that has no channel
    userNoChannel = await PushAPI.initialize(noChannelSigner, { env: _env });
    // viem signer
    viemUser = await PushAPI.initialize(viemSigner, { env: _env });
  });

  describe('channel :: info', () => {
    // TODO: remove skip after signer becomes optional
    it.skip('Without signer and account: Should throw error', async () => {
      await expect(() => userBob.channel.info()).to.Throw;
    });

    it('Without signer but with non-caip account: Should return response', async () => {
      const res = await userBob.channel.info(
        '0xD8634C39BBFd4033c0d3289C4515275102423681'
      );
      expect(res).not.null;
    });

    it('Without signer and with valid caip account: Should return response', async () => {
      const res = await userBob.channel.info(
        'eip155:5:0xD8634C39BBFd4033c0d3289C4515275102423681',
        {
          raw: false,
        }
      );
      console.log(res.channel_settings);
      expect(res).not.null;
    });
  });

  describe('channel :: search', () => {
    it('Without signer and account : Should return response', async () => {
      const res = await userBob.channel.search(' ');
      // console.log(res);
      expect(res).not.null;
    });

    it('With signer: Should return response', async () => {
      const res = await userBob.channel.search(' ');
      // console.log(res);
      expect(res).not.null;
    });

    it('Should throw error for empty query', async () => {
      // const res = await userBob.channel.search('')
      await expect(() => userBob.channel.search('')).to.Throw;
    });
  });

  describe('channel :: subscribers', () => {
    // TODO: remove skip after signer becomes optional
    it.skip('Without signer and account : Should throw error', async () => {
      await expect(() => userBob.channel.subscribers()).to.Throw;
    });

    it('Without signer and account : Should return response as address is passed', async () => {
      const res = await userBob.channel.subscribers({
        channel: 'eip155:5:0x93A829d16DE51745Db0530A0F8E8A9B8CA5370E5',
      });
      console.log(res);
      expect(res).not.null;
    });

    it('Without signer and account : Should return response as address is passed', async () => {
      const res = await userBob.channel.subscribers({
        channel: '0x93A829d16DE51745Db0530A0F8E8A9B8CA5370E5',
      });
      // console.log(res)
      expect(res).not.null;
    });

    it('Without signer and account : Should return response as address is passed', async () => {
      const res = await userBob.channel.subscribers({
        channel: '0x93A829d16DE51745Db0530A0F8E8A9B8CA5370E5',
        page: 1,
        limit: 10,
      });
      // console.log(res)
      expect(res).not.null;
    });

    it('Without signer and account : Should return response for alias address', async () => {
      const res = await userBob.channel.subscribers({
        channel: 'eip155:80001:0x93A829d16DE51745Db0530A0F8E8A9B8CA5370E5',
      });
      // console.log(res)
      expect(res).not.null;
    });

    it('Without signer and account : Should return response without passing the options', async () => {
      const res = await userKate.channel.subscribers();
      expect(res).not.null;
    });

    it('With signer and account : Should return response without passing the options', async () => {
      const res = await userKate.channel.subscribers({ page: 1, limit: 10 });
      // console.log(res)
      expect(res).not.null;
    });

    it('With signer and account : Should return response with settings', async () => {
      const res = await userKate.channel.subscribers({
        page: 1,
        limit: 10,
        setting: true,
      });
      console.log(res);
      expect(res).not.null;
    });

    it('With signer and account : Should return response without settings', async () => {
      const res = await userKate.channel.subscribers({
        page: 1,
        limit: 10,
        setting: false,
        category: 1,
      });
      // console.log(res)
      expect(res).not.null;
    });

    it('With signer and account : Should return response with settings', async () => {
      const res = await userKate.channel.subscribers({
        page: 1,
        limit: 10,
        setting: true,
        raw: false,
      });
      // console.log(JSON.stringify(res))
      expect(res).not.null;
    });

    it('Without signer and account : Should throw error for invalid caip', async () => {
      await expect(() =>
        userBob.channel.subscribers({
          channel: '0x93A829d16DE51745Db0530A0F8E8A9B8CA5370E5',
        })
      ).to.Throw;
    });
  });

  describe.only('channel :: send', () => {
    it('With signer : broadcast  : Should send notification with title and body', async () => {
      const res = await userAlice.channel.send(['*'], {
        notification: {
          title: 'test',
          body: 'test',
        },
      });
      expect(res.status).to.equal(200);
    });

    it('With signer : targeted  : Should send notification with title and body', async () => {
      const res = await userAlice.channel.send(
        ['eip155:5:0xD8634C39BBFd4033c0d3289C4515275102423681'],
        {
          notification: {
            title: 'hi',
            body: 'test-targeted',
          },
        }
      );
      expect(res.status).to.equal(200);
    });

    it('With signer : targeted  : Should send notification with title and body', async () => {
      const res = await userAlice.channel.send(
        ['eip155:5:0x93A829d16DE51745Db0530A0F8E8A9B8CA5370E5'],
        {
          notification: {
            title: 'hi',
            body: 'test-targeted',
          },
        }
      );
      expect(res.status).to.equal(200);
    });

    it('With signer : subset  : Should send notification with title and body', async () => {
      const res = await userAlice.channel.send(
        [
          'eip155:5:0xD8634C39BBFd4033c0d3289C4515275102423681',
          'eip155:5:0x93A829d16DE51745Db0530A0F8E8A9B8CA5370E5',
        ],
        {
          notification: {
            title: 'hi',
            body: 'test-targeted',
          },
        }
      );
      expect(res.status).to.equal(200);
    });

    it('With signer : subset  : Should send notification with title and body along with additional options', async () => {
      const res = await userAlice.channel.send(
        [
          'eip155:5:0xD8634C39BBFd4033c0d3289C4515275102423681',
          'eip155:5:0x93A829d16DE51745Db0530A0F8E8A9B8CA5370E5',
        ],
        {
          notification: {
            title: 'hi',
            body: 'test-targeted',
          },
          payload: {
            title: 'testing first notification',
            body: 'testing with random body',
            cta: 'https://google.com/',
            embed: 'https://avatars.githubusercontent.com/u/64157541?s=200&v=4',
            category: 2,
          },
        }
      );
      expect(res.status).to.equal(200);
    });

    it('With signer : subset  : Should send notification with title and body along with additional options', async () => {
      const res = await userAlice.channel.send(
        [
          'eip155:5:0xD8634C39BBFd4033c0d3289C4515275102423681',
          'eip155:5:0x93A829d16DE51745Db0530A0F8E8A9B8CA5370E5',
        ],
        {
          notification: {
            title: 'hi',
            body: 'test-targeted',
          },
          payload: {
            title: 'testing first notification',
            body: 'testing with random body',
            cta: 'https://google.com/',
            embed: 'https://avatars.githubusercontent.com/u/64157541?s=200&v=4',
            category: 3,
          },
        }
      );
      expect(res.status).to.equal(200);
    });

    it('With signer : subset  : Should send notification with title and body along with additional options', async () => {
      const res = await userAlice.channel.send(
        [
          'eip155:5:0xD8634C39BBFd4033c0d3289C4515275102423681',
          'eip155:5:0x93A829d16DE51745Db0530A0F8E8A9B8CA5370E5',
        ],
        {
          notification: {
            title: 'hi',
            body: 'test-subset',
          },
          payload: {
            title: 'testing first subset notification',
            body: 'testing with random body',
            cta: 'https://google.com/',
            embed: 'https://avatars.githubusercontent.com/u/64157541?s=200&v=4',
          },
        }
      );
      expect(res.status).to.equal(200);
    });
  });

  describe('channel :: update', () => {
    it('Should update channel meta', async () => {
      const res = await userKate.channel.update({
        name: 'Updated Name',
        description: 'Testing new description',
        url: 'https://google.com',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAz0lEQVR4AcXBsU0EQQyG0e+saWJ7oACiKYDMEZVs6GgSpC2BIhzRwAS0sgk9HKn3gpFOAv3v3V4/3+4U4Z1q5KTy42Ql940qvFONnFSGmCFmiN2+fj7uCBlihpgh1ngwcvKfwjuVIWaIGWKNB+GdauSk8uNkJfeNKryzYogZYoZY40m5b/wlQ8wQM8TayMlKeKcaOVkJ71QjJyuGmCFmiDUe+HFy4VyEd57hx0mV+0ZliBlihlgL71w4FyMnVXhnZeSkiu93qheuDDFDzBD7BcCyMAOfy204AAAAAElFTkSuQmCC',
      });
      //   console.log(res)
      expect(res).not.null;
    }, 10000000000);

    it('Should update channel meta', async () => {
      const res = await viemUser.channel.update({
        name: 'Updated Name',
        description: 'Testing new description',
        url: 'https://google.com',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAz0lEQVR4AcXBsU0EQQyG0e+saWJ7oACiKYDMEZVs6GgSpC2BIhzRwAS0sgk9HKn3gpFOAv3v3V4/3+4U4Z1q5KTy42Ql940qvFONnFSGmCFmiN2+fj7uCBlihpgh1ngwcvKfwjuVIWaIGWKNB+GdauSk8uNkJfeNKryzYogZYoZY40m5b/wlQ8wQM8TayMlKeKcaOVkJ71QjJyuGmCFmiDUe+HFy4VyEd57hx0mV+0ZliBlihlgL71w4FyMnVXhnZeSkiu93qheuDDFDzBD7BcCyMAOfy204AAAAAElFTkSuQmCC',
      });
      //   console.log(res)
      expect(res).not.null;
    }, 10000000000);
  });

  describe.skip('channel :: create', () => {
    it('Should create channel', async () => {
      const channelInfo = await userKate.channel.info();
      if (channelInfo) return; // skip if already exists
      const res = await userKate.channel.create({
        name: 'SDK Test',
        description: 'Testing new description',
        url: 'https://google.com',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAz0lEQVR4AcXBsU0EQQyG0e+saWJ7oACiKYDMEZVs6GgSpC2BIhzRwAS0sgk9HKn3gpFOAv3v3V4/3+4U4Z1q5KTy42Ql940qvFONnFSGmCFmiN2+fj7uCBlihpgh1ngwcvKfwjuVIWaIGWKNB+GdauSk8uNkJfeNKryzYogZYoZY40m5b/wlQ8wQM8TayMlKeKcaOVkJ71QjJyuGmCFmiDUe+HFy4VyEd57hx0mV+0ZliBlihlgL71w4FyMnVXhnZeSkiu93qheuDDFDzBD7BcCyMAOfy204AAAAAElFTkSuQmCC',
      });
      //   console.log(res)
      expect(res).not.null;
    }, 10000000000);
  });

  describe('channel :: settings', () => {
    it('Should create channel settings', async () => {
      const res = await userKate.channel.setting([
        {
          type: 1,
          default: 1,
          description: 'test1',
        },
        {
          type: 2,
          default: 10,
          description: 'test2',
          data: {
            upper: 100,
            lower: 1,
          },
        },
        {
          type: 3,
          default: {
            lower: 10,
            upper: 50,
          },
          description: 'test3',
          data: {
            upper: 100,
            lower: 1,
            enabled: true,
            ticker: 2,
          },
        },
        {
          type: 3,
          default: {
            lower: 3,
            upper: 5,
          },
          description: 'test4',
          data: {
            upper: 100,
            lower: 1,
            enabled: false,
            ticker: 2,
          },
        },
      ]);
      //   console.log(res)
      expect(res).not.null;
    }, 10000000000);

    it('Should create channel setting viem signer', async () => {
      const res = await viemUser.channel.setting([
        {
          type: 1,
          default: 1,
          description: 'test1',
        },
        {
          type: 2,
          default: 10,
          description: 'test2',
          data: {
            upper: 100,
            lower: 1,
          },
        },
        {
          type: 3,
          default: {
            lower: 10,
            upper: 50,
          },
          description: 'test3',
          data: {
            upper: 100,
            lower: 1,
            enabled: true,
            ticker: 2,
          },
        },
        {
          type: 3,
          default: {
            lower: 3,
            upper: 5,
          },
          description: 'test4',
          data: {
            upper: 100,
            lower: 1,
            enabled: false,
            ticker: 2,
          },
        },
      ]);
      // console.log(res)
      expect(res).not.null;
    }, 10000000000);
  });

  describe('notifications', async () => {
    it('Should fetch channel specific feeds', async () => {
      const res = await userAlice.channel.notifications(
        'eip155:5:0xD8634C39BBFd4033c0d3289C4515275102423681',
        { raw: false }
      );
      console.log(inspect(res, { depth: null }));
      expect(res).not.null;
    });

    it('Should fetch channel specific feeds in raw format', async () => {
      const res = await userAlice.channel.notifications(
        'eip155:5:0xD8634C39BBFd4033c0d3289C4515275102423681',
        { raw: true }
      );
      console.log(inspect(res, { depth: null }));
      expect(res).not.null;
    });

    it('Should fetch channel specific feeds broadcast type', async () => {
      const res = await userAlice.channel.notifications(
        '0xD8634C39BBFd4033c0d3289C4515275102423681',
        { raw: false, filter: CONSTANTS.NOTIFICATION.TYPE.TARGETTED }
      );
      console.log(inspect(res, { depth: null }));
      expect(res).not.null;
    });
  });
});
