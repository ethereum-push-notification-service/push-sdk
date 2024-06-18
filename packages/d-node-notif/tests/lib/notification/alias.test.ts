import { PushAPI } from '../../../src/lib/pushAPI/PushAPI';
import { expect } from 'chai';
import { ethers } from 'ethers';
import { bsc, bscTestnet, sepolia } from 'viem/chains';
import { ENV } from '../../../src/lib/constants';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

describe('PushAPI.alias functionality', () => {
  let userAlice: PushAPI;
  let userBob: PushAPI;
  let userKate: PushAPI;
  let userSam: PushAPI;
  let signer1: any;
  let account1: string;
  let signer2: any;
  let viemUser: any;
  let viemUser1: any;
  let account2: string;

  // accessing env dynamically using process.env
  type EnvStrings = keyof typeof ENV;
  const envMode = process.env.ENV as EnvStrings;
  const _env = ENV[envMode];

  beforeEach(async () => {
    signer1 = new ethers.Wallet(`0x${process.env['WALLET_PRIVATE_KEY']}`);
    account1 = await signer1.getAddress();

    const provider = (ethers as any).providers
      ? new (ethers as any).providers.JsonRpcProvider('https://rpc.sepolia.org')
      : new (ethers as any).JsonRpcProvider('https://rpc.sepolia.org');

    const provider1 = (ethers as any).providers
      ? new (ethers as any).providers.JsonRpcProvider(
          'https://bsc-testnet-rpc.publicnode.com'
        )
      : new (ethers as any).JsonRpcProvider(
          'https://bsc-testnet-rpc.publicnode.com'
        );

    signer2 = new ethers.Wallet(
      `0x${process.env['WALLET_PRIVATE_KEY']}`,
      provider
    );

    const signer3 = createWalletClient({
      account: privateKeyToAccount(`0x${process.env['WALLET_PRIVATE_KEY']}`),
      chain: sepolia,
      transport: http(),
    });

    const signer4 = new ethers.Wallet(
      `0x${process.env['NFT_HOLDER_WALLET_PRIVATE_KEY_1']}`,
      provider1
    );

    const signer5 = createWalletClient({
      account: privateKeyToAccount(
        `0x${process.env['NFT_HOLDER_WALLET_PRIVATE_KEY_1']}`
      ),
      chain: bscTestnet,
      transport: http(),
    });

    account2 = await signer2.getAddress();

    // initialization with signer
    userAlice = await PushAPI.initialize(signer1, { env: _env });

    // initialization with signer and provider
    userKate = await PushAPI.initialize(signer2, { env: _env });

    //initialisation without signer
    userBob = await PushAPI.initialize(signer1, { env: _env });

    // initalisation with viem
    viemUser = await PushAPI.initialize(signer3, { env: _env });

    // initalisation the verification account
    userSam = await PushAPI.initialize(signer4, { env: _env });
    viemUser1 = await PushAPI.initialize(signer5, { env: _env });
  });

  describe('alias :: info', () => {
    it('Should return response', async () => {
      const res = await userBob.channel.alias.info({
        alias: '0x93A829d16DE51745Db0530A0F8E8A9B8CA5370E5',
        aliasChain: 'POLYGON',
      });
      expect(res).not.null;
    });
  });

  describe('alias :: add', () => {
    // TODO: remove skip after signer becomes optional
    it('Without signer and account :: should throw error', async () => {
      await expect(() =>
        userBob.channel.alias.initiate(
          'eip155:5:0x74415Bc4C4Bf4Baecc2DD372426F0a1D016Fa924'
        )
      ).to.Throw;
    });

    it('With signer and without provider :: should throw error', async () => {
      await expect(() =>
        userAlice.channel.alias.initiate(
          'eip155:5:0x74415Bc4C4Bf4Baecc2DD372426F0a1D016Fa924'
        )
      ).to.Throw;
    });

    it('With signer and provider :: should add alias', async () => {
      const res = await userKate.channel.alias.initiate(
        'eip155:97:0x2dFc6E90B9Cd0Fc1E0A2da82e3b094e9369caCdB'
      );
      expect(res).not.null;
    }, 100000000);

    it('With signer and provider :: should add alias', async () => {
      const res = await userKate.channel.alias.initiate(
        'eip155:97:0x2dFc6E90B9Cd0Fc1E0A2da82e3b094e9369caCdB',
        { raw: true }
      );
      expect(res).not.null;
    }, 100000000);

    it('With viem signer and provider :: should add alias', async () => {
      const res = await viemUser.channel.alias.initiate(
        'eip155:97:0x2dFc6E90B9Cd0Fc1E0A2da82e3b094e9369caCdB'
      );
      expect(res).not.null;
    }, 100000000);

    it('With signer and provider :: should throw error and provider doesnt match', async () => {
      await expect(() =>
        userAlice.channel.alias.initiate(
          'eip155:97:0x2dFc6E90B9Cd0Fc1E0A2da82e3b094e9369caCdB'
        )
      ).to.Throw;
    });
  });

  describe('alias :: verify', () => {
    it('Without signer and account :: should throw error', async () => {
      await expect(() =>
        userBob.channel.alias.verify(
          'eip155:5:0x74415Bc4C4Bf4Baecc2DD372426F0a1D016Fa924'
        )
      ).to.Throw;
    });

    it('With signer and without provider :: should throw error', async () => {
      await expect(() =>
        userAlice.channel.alias.verify(
          'eip155:5:0x74415Bc4C4Bf4Baecc2DD372426F0a1D016Fa924'
        )
      ).to.Throw;
    });

    it('With signer and provider :: should verify alias', async () => {
      const res = await userSam.channel.alias.verify(
        '0x6eF394b8dcc840d3d65a835E371066244187B1C6',
        { raw: true }
      );
      expect(res).not.null;
    }, 100000000);
  });
});
