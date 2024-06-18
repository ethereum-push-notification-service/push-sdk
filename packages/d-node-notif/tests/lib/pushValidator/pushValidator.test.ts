import { PushValidator } from '../../../src/lib/pushValidator/pushValidator';
import { expect } from 'chai';
import { ethers } from 'ethers';
import { ENV } from '../../../src/lib/constants';
import { ActiveValidator } from '../../../src/lib/pushValidator/pushValidatorTypes';

describe('PushValidator Class', () => {
  // accessing env dynamically using process.env
  const envMode = process.env.ENV as keyof typeof ENV;
  const env = ENV[envMode];

  it('Initialize PushValidator', async () => {
    const validatorInstance = await PushValidator.initalize({ env });
    expect(validatorInstance.env).to.equal(env);

    /**
     * @dev - TS is a funny language, add `any` and access private properties
     */
    const activeValidators = (
      (await (
        validatorInstance as any
      ).validatorContractClient.read.getActiveVNodes()) as []
    ).map((each) => {
      return (each as any).nodeApiBaseUrl;
    });

    expect(validatorInstance.activeValidatorURL).to.be.oneOf(activeValidators);
  });
  it('Ping every active validator node', async () => {
    const validatorInstance = await PushValidator.initalize({ env });

    const activeValidators: ActiveValidator[] = await (
      validatorInstance as any
    ).validatorContractClient.read.getActiveVNodes();

    for (const each of activeValidators) {
      const pingReply = await validatorInstance.ping(each.nodeApiBaseUrl);
      expect(pingReply).to.not.be.null;
      expect(pingReply?.nodeId).to.equal(each.nodeWallet);
      expect(pingReply?.status).to.equal(1);
    }
  });
  it('Ping active read validator node', async () => {
    const validatorInstance = await PushValidator.initalize({ env });
    // default active read validator
    const pingReply = await validatorInstance.ping();
    expect(pingReply).to.not.be.null;
    expect(pingReply?.status).to.equal(1);
  });
  it('Get token from random active validator node', async () => {
    const validatorInstance = await PushValidator.initalize({ env });
    const token = await validatorInstance.getToken();
    expect(token).to.not.be.null;
    expect(token?.validatorToken).to.be.string;
    expect(token?.validatorUrl).to.be.string;
  });
});
