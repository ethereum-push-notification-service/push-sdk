import {
  recoverTypedSignature,
  SignTypedDataVersion,
} from '@metamask/eth-sig-util';
import * as viem from 'viem';

/**
 *
 * @param chainId
 * @returns
 */
export const getDomainInformation = (chainId: number) => {
  const chatVerifyingContract = '0x0000000000000000000000000000000000000000';
  return {
    name: 'PUSH CHAT ID',
    chainId,
    verifyingContract: chatVerifyingContract,
  };
};

/**
 *
 * @param action
 * @returns
 */
export const getTypeInformation = () => {
  return {
    Data: [{ name: 'data', type: 'string' }],
  };
};

/**
 *
 * @param signedData
 * @param chainId
 * @param version
 * @returns typedData for typedV4 EIP712 sig
 */
export const getTypedData = (
  signedData: string,
  chainId: number,
  version: 'V1' | 'V2'
) => {
  const message = { data: signedData };
  const typeInformation = getTypeInformation();
  const domainInformation = getDomainInformation(chainId);
  const primaryType = 'Data' as const;
  let types: any;
  let domain = {};

  if (version === 'V1') {
    types = {
      EIP712Domain: [],
      Data: typeInformation.Data,
    };
  } else {
    types = {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      Data: typeInformation.Data,
    };
    domain = domainInformation;
  }

  return {
    types,
    primaryType,
    domain,
    message,
  };
};

/**
 *
 * @param signature
 * @param signedData
 * @param address
 * @param chainId
 * @returns
 */
export const verifyProfileSignature = async (
  verificationProof: string,
  signedData: string,
  address: string
): Promise<boolean> => {
  const SIG_TYPE_V2 = 'eip712v2';
  const SIG_TYPE_V3 = 'eip191';
  const SIG_TYPE_V4 = 'eip191v2';
  let chainId: number | null = null;
  let signature: string;
  const sigType = verificationProof.split(':')[0];
  if (
    (sigType !== SIG_TYPE_V2 &&
      sigType !== SIG_TYPE_V3 &&
      sigType !== SIG_TYPE_V4) ||
    verificationProof.split(':').length > 3
  ) {
    return false;
  }
  if (verificationProof.split(':').length === 2) {
    signature = verificationProof.split(':')[1];
  } else {
    chainId = parseInt(verificationProof.split(':')[1]);
    signature = verificationProof.split(':')[2];
  }

  if (sigType === SIG_TYPE_V2) {
    try {
      // EIP712 sig validation with empty domain
      // V2 should be checked first rather than v1 otherwise validation will fail
      const typedData = getTypedData(signedData, chainId as number, 'V2'); // For backward compatibility
      const recoveredAddress = recoverTypedSignature({
        data: typedData,
        signature: signature,
        version: SignTypedDataVersion.V4,
      });
      if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
        return true;
      } else return false;
    } catch (err) {
      // EIP712 sig validation with domain details
      const typedData = getTypedData(signedData, chainId as number, 'V1'); // For backward compatibility
      const recoveredAddress = recoverTypedSignature({
        data: typedData,
        signature: signature,
        version: SignTypedDataVersion.V4,
      });
      if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
        return true;
      } else return false;
    }
  } else {
    // EIP191 sig validation
    try {
      // EOA Wallet
      const recoveredAddress = await viem.recoverAddress({
        hash: viem.hashMessage(signedData),
        signature: signature as `0x${string}`,
      });
      if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
        return true;
      } else return false;
    } catch (err) {
      return false;
    }
  }
};
