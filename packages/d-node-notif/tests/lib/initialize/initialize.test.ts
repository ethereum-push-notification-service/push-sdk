import { PushAPI } from '../../../src/lib/pushAPI/PushAPI';
import { expect } from 'chai';
import { ethers } from 'ethers';
import { ENV } from '../../../src/lib/constants';

describe('PushAPI.channel functionality', () => {
  // accessing env dynamically using process.env
  const envMode = process.env.ENV as keyof typeof ENV;
  const env = ENV[envMode];

  let signer: ethers.Wallet;

  beforeEach(async () => {
    signer = ethers.Wallet.createRandom();
  });

  it('Initialize user', async () => {
    await PushAPI.initialize(signer, {
      env,
    });
  });
});
