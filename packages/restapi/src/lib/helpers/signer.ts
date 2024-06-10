import { SignerType, viemSignerType } from '../types';
import { TypedDataField, TypedDataDomain } from '../types';

export class Signer {
  private signer: SignerType;

  constructor(signer: SignerType) {
    this.signer = signer;
  }

  /**
   * Determine if the signer is a Viem signer
   */
  isViemSigner(signer: SignerType): signer is viemSignerType {
    return (
      typeof (signer as any).signTypedData === 'function' &&
      typeof (signer as any).getChainId === 'function' &&
      signer.signMessage.length === 1 && // Checking if the function takes one argument
      (signer as any).signTypedData.length === 1 // Checking if the function takes one argument
    );
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    if (
      'signMessage' in this.signer &&
      typeof this.signer.signMessage === 'function'
    ) {
      if (this.isViemSigner(this.signer)) {
        // Viem signer requires additional arguments
        return this.signer.signMessage({
          message,
          account: this.signer.account,
        });
      } else {
        // EthersV5 and EthersV6
        return this.signer.signMessage(message);
      }
    } else {
      throw new Error('Signer does not support signMessage');
    }
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    value: Record<string, any>,
    primaryType?: string
  ): Promise<string> {
    if (this.isViemSigner(this.signer)) {
      // Call Viem's signTypedData with its specific structure
      return this.signer.signTypedData({
        domain: domain,
        types: types,
        primaryType: primaryType,
        message: value,
        account: this.signer.account,
      });
    } else if ('_signTypedData' in this.signer) {
      // ethersV5 signer uses _signTypedData
      return this.signer._signTypedData(domain, types, value);
    } else if ('signTypedData' in this.signer) {
      // ethersV6 signer uses signTypedData
      return this.signer.signTypedData(domain, types, value);
    } else {
      throw new Error('Signer does not support signTypedData');
    }
  }

  async getAddress(): Promise<string> {
    if (this.isViemSigner(this.signer)) {
      return this.signer.account['address'] ?? '';
    } else {
      return await this.signer.getAddress();
    }
  }

  async getChainId(): Promise<number> {
    if (this.isViemSigner(this.signer)) {
      // Viem signer has a direct method for getChainId
      return this.signer.getChainId();
    } else if ('provider' in this.signer && this.signer.provider) {
      // EthersV5 and EthersV6
      const network = await this.signer.provider.getNetwork();
      return Number(network.chainId);
    } else {
      return 1; // Return default chainId
    }
  }

  async isSmartContract(): Promise<boolean> {
    let code: string;
    const address = await this.getAddress();
    if (this.isViemSigner(this.signer)) {
      // Viem signer has a direct method for getCode
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      code = await this.signer.getBytecode({ address });
    } else if ('provider' in this.signer && this.signer.provider) {
      // EthersV5 and EthersV6
      code = await this.signer.provider.getCode(address);
    } else {
      code = '0x'; // Return default
    }
    return code !== '0x';
  }
}
