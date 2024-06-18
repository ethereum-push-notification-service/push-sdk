import { ethers } from 'ethers';
import { PushAPI } from '../../../src';
import { ENV } from '../../../src/lib/constants';

describe('POLYGON ALIAS functionality', () => {
  let userAlice: PushAPI;
  let userBob: PushAPI;
  let account: string;
  let account2: string;

  // accessing env dynamically using process.env
  type EnvStrings = keyof typeof ENV;
  const envMode = process.env.ENV as EnvStrings;
  const _env = ENV[envMode];

  before(async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://rpc-amoy.polygon.technology/'
    );
    const signer = new ethers.Wallet(
      `0x${process.env['POLYGON_CHANNEL_PRIVATE_KEY']}`,
      provider
    );
    account = signer.address;
    userAlice = await PushAPI.initialize(signer, {
      env: _env,
    });

    const signer2 = new ethers.Wallet(ethers.Wallet.createRandom().privateKey);
    account2 = signer2.address;
    userBob = await PushAPI.initialize(signer2, { env: _env });
  });

  it.skip('Should be able to create channel', async () => {
    const res = await userAlice.channel.create({
      name: 'SDK Alias Test',
      description: 'Testing using sdk',
      url: 'https://push.org',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAz0lEQVR4AcXBsU0EQQyG0e+saWJ7oACiKYDMEZVs6GgSpC2BIhzRwAS0sgk9HKn3gpFOAv3v3V4/3+4U4Z1q5KTy42Ql940qvFONnFSGmCFmiN2+fj7uCBlihpgh1ngwcvKfwjuVIWaIGWKNB+GdauSk8uNkJfeNKryzYogZYoZY40m5b/wlQ8wQM8TayMlKeKcaOVkJ71QjJyuGmCFmiDUe+HFy4VyEd57hx0mV+0ZliBlihlgL71w4FyMnVXhnZeSkiu93qheuDDFDzBD7BcCyMAOfy204AAAAAElFTkSuQmCC',
      alias: `eip155:80002:${account}`,
      progressHook: (progress: any) => console.log(progress),
    });
  });

  it('Should be able to send notifications', async () => {
    await userAlice.channel.send(['*'], {
      notification: {
        title: 'hi',
        body: 'test-broadcast',
      },
      payload: {
        title: 'testing broadcast notification',
        body: 'testing with random body',
        cta: 'https://google.com/',
        embed: 'https://avatars.githubusercontent.com/u/64157541?s=200&v=4',
      },
      channel: `eip155:80002:${account}`,
    });
  });

  it('Should be able to add delegatee', async () => {
    await userAlice.channel.delegate.add(account2);
  });

  it('Should be able to send notifications from delegate', async () => {
    await userBob.channel.send(['*'], {
      notification: {
        title: 'hi',
        body: 'test-broadcast',
      },
      payload: {
        title: 'testing broadcast notification',
        body: 'testing with random body',
        cta: 'https://google.com/',
        embed: 'https://avatars.githubusercontent.com/u/64157541?s=200&v=4',
      },
      channel: `eip155:80002:${account}`,
    });
  });

  it('Should be able to remove delegatee', async () => {
    await userAlice.channel.delegate.remove(account2);
  });
});
