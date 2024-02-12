import * as LitJsSdk from '@lit-protocol/lit-node-client-nodejs';
import { ethers } from 'ethers';
import * as siwe from 'siwe';
const accessControlConditions = (address: string) => {
  return [
    {
      contractAddress: '',
      standardContractType: '',
      chain: 'ethereum',
      method: '',
      parameters: [':userAddress'],
      returnValueTest: {
        comparator: '=',
        value: address
      }
    }
  ];
};

export class Lit {
  private litNodeClient: any;
  private signer: any;
  private authSig: any;
  constructor(signer: any) {
    this.signer = signer;
    this.litNodeClient = null;
    this.authSig = null;
  }
  async connect() {
    try {
      this.litNodeClient = new LitJsSdk.LitNodeClientNodeJs({
        alertWhenUnauthorized: false,
        litNetwork: 'cayenne'
      });
      await this.litNodeClient.connect();

      const nonce = this.litNodeClient.getLatestBlockhash();

      const address = await this.signer.getAddress();

      // Craft the SIWE message
      const domain = 'localhost';
      const origin = 'https://localhost/login';
      const statement =
        'This is a test statement.  You can put anything you want here.';
      const siweMessage = new siwe.SiweMessage({
        domain,
        address: address,
        statement,
        uri: origin,
        version: '1',
        chainId: 1,
        nonce,
        expirationTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
      });
      const messageToSign = siweMessage.prepareMessage();

      // Sign the message and format the authSig
      const signature = await this.signer.signMessage(messageToSign);

      const authSig = {
        sig: signature,
        derivedVia: 'web3.eth.personal.sign',
        signedMessage: messageToSign,
        address: address
      };

      this.authSig = authSig;
    } catch (error) {
     throw new Error("Error while connecting to LIT")
    }
  }

  async encrypt(address: any, secret: string) {
    try {
      if (!this.authSig) {
        await this.connect();
      }
      return await LitJsSdk.encryptString(
        {
          accessControlConditions: accessControlConditions(address),
          authSig: this.authSig,
          chain: 'ethereum',
          dataToEncrypt: secret
        },
        this.litNodeClient
      );
    } catch (error) {
      return new Error("Error while encrypting via LIT")
    }
  }

  async decrypt({
    ciphertext,
    dataToEncryptHash,
  }: {
    ciphertext: string;
    dataToEncryptHash: string;
  }) {
    try {
      if (!this.authSig) {
        await this.connect();
      }
      const address = await this.signer.getAddress();
      const decryptedString = await LitJsSdk.decryptToString(
        {
          accessControlConditions: accessControlConditions(address),
          ciphertext,
          dataToEncryptHash,
          authSig: this.authSig,
          chain: 'ethereum'
        },
        this.litNodeClient
      );
      return decryptedString;
    } catch (error) {
      return ''
    }
  }
}


