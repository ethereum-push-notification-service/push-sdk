import * as LitJsSdk from '@lit-protocol/lit-node-client';
import * as siwe from 'siwe';
import { SignerType } from '../types';
import { ENV } from '../constants';
import { isValidSCWCAIP, pCAIP10ToWallet } from './address';
import * as viem from 'viem';
import { Signer } from './signer';

export class Lit {
  public static LitInstance: Lit;
  private litNodeClient: LitJsSdk.LitNodeClient;
  private chain: string;
  private accessControlConditions: any[];
  private address: string;
  private signer: SignerType;

  private constructor(
    signer: SignerType,
    address: string,
    chain: string,
    litNodeClient: LitJsSdk.LitNodeClient
  ) {
    this.signer = signer;
    this.address = isValidSCWCAIP(address)
      ? address.split(':')[3]
      : pCAIP10ToWallet(address);
    this.chain = chain;
    this.litNodeClient = litNodeClient;
    // Access control conditions for encryption and decryption
    // wallet owner can encrypt and decrypt
    this.accessControlConditions = [
      {
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: '',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '=',
          value: this.address,
        },
      },
    ];
  }

  private async prepareSCWAuthSig(
    signer: SignerType,
    address: string,
    chainId: number
  ) {
    const domain = 'push.org';
    const origin = 'https://app.push.org';
    const statement = 'Enable Push Profile';
    const nonce = await this.litNodeClient.getLatestBlockhash();

    const siweMessage = new siwe.SiweMessage({
      domain,
      address,
      statement,
      uri: origin,
      version: '1',
      chainId,
      nonce,
      expirationTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    });
    const messageToSign = siweMessage.prepareMessage();

    // Sign the message and format the authSig
    const pushSigner = new Signer(signer);
    const signature = await pushSigner.signMessage(messageToSign as any);

    const authSig = {
      sig: signature,
      derivedVia: 'EIP1271',
      signedMessage: viem.hashMessage(messageToSign),
      address,
    };
    return authSig;
  }

  public async encrypt(dataToEncrypt: string, chainId: number) {
    const authSig = await this.prepareSCWAuthSig(
      this.signer,
      this.address,
      chainId
    );

    console.info(authSig);
    console.info(this.accessControlConditions);
    console.info(this.chain);
    console.info(dataToEncrypt);

    const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
      {
        accessControlConditions: this.accessControlConditions,
        authSig,
        // chain on which the wallet exists
        chain: this.chain,
        dataToEncrypt,
      },
      this.litNodeClient
    );

    return {
      ciphertext,
      dataToEncryptHash,
    };
  }

  public async decrypt(
    ciphertext: string,
    dataToEncryptHash: string,
    chainId: number
  ): Promise<string> {
    const authSig = await this.prepareSCWAuthSig(
      this.signer,
      this.address,
      chainId
    );

    console.info(authSig);
    console.info(this.accessControlConditions);
    console.info(this.chain);
    console.info(dataToEncryptHash);
    console.info(ciphertext);

    return await LitJsSdk.decryptToString(
      {
        accessControlConditions: this.accessControlConditions,
        ciphertext,
        dataToEncryptHash,
        authSig,
        // chain on which the wallet exists
        chain: this.chain,
      },
      this.litNodeClient
    );
  }

  public static async createInstance(
    signer: SignerType,
    address: string,
    chain: string,
    env: ENV = ENV.STAGING
  ) {
    if (!this.LitInstance) {
      const litNodeClient = new LitJsSdk.LitNodeClient({
        debug: false,
        litNetwork: env === ENV.PROD ? 'habanero' : 'manzano',
      });
      await litNodeClient.connect();
      this.LitInstance = new Lit(signer, address, chain, litNodeClient);
    }
    return this.LitInstance;
  }
}
