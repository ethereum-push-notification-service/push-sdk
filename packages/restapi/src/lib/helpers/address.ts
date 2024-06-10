import * as viem from 'viem';
import Constants, { ENV } from '../constants';
import { get } from '../user';
import { SignerType } from '../types';
import { Signer } from './signer';

export interface AddressValidatorsType {
  [key: string]: ({ address }: { address: string }) => boolean;
}

/**
 * CHECK IF THE WALLET IS A VALID PUSH CAIP SCW DID
 * @param wallet scw:eip155:chainId:address
 * @returns boolean
 */
export const isValidSCWCAIP = (wallet: string) => {
  try {
    const walletComponent = wallet.split(':');
    return (
      walletComponent.length === 4 &&
      walletComponent[0] === 'scw' &&
      walletComponent[1] === 'eip155' &&
      !isNaN(Number(walletComponent[2])) &&
      Number(walletComponent[2]) > 0 &&
      viem.isAddress(walletComponent[3])
    );
  } catch (err) {
    return false;
  }
};

/**
 * CHECK IF THE WALLET IS A VALID PUSH CAIP NFT DID
 * @param wallet nft:eip155:nftChainId:nftContractAddress:nftTokenId
 * @returns boolean
 */
export const isValidNFTCAIP = (wallet: string): boolean => {
  try {
    const walletComponent = wallet.split(':');
    return (
      (walletComponent.length === 5 || walletComponent.length === 6) &&
      walletComponent[0].toLowerCase() === 'nft' &&
      !isNaN(Number(walletComponent[4])) &&
      Number(walletComponent[4]) > 0 &&
      !isNaN(Number(walletComponent[2])) &&
      Number(walletComponent[2]) > 0 &&
      viem.isAddress(walletComponent[3]) &&
      walletComponent[1] === 'eip155'
    );
  } catch (err) {
    return false;
  }
};

/**
 * CHECK IF THE WALLET IS A VALID PUSH CAIP EOA DID
 * @param wallet eip155:chainId:address | eip155:address
 * @returns
 */
export const isValidEOACAIP = (wallet: string): boolean => {
  try {
    const walletComponent = wallet.split(':');
    if (walletComponent.length === 3) {
      return (
        walletComponent[0] === 'eip155' &&
        !isNaN(Number(walletComponent[1])) &&
        Number(walletComponent[1]) > 0 &&
        viem.isAddress(walletComponent[2])
      );
    }
    if (walletComponent.length === 2) {
      return (
        walletComponent[0] === 'eip155' && viem.isAddress(walletComponent[1])
      );
    }
    return false;
  } catch (err) {
    return false;
  }
};

/**
 * CHECK IF THE WALLET IS A VALID PUSH CAIP
 * @param wallet
 * @returns boolean
 */
export const isValidPushCAIP = (wallet: string): boolean => {
  return (
    isValidEOACAIP(wallet) ||
    isValidSCWCAIP(wallet) ||
    isValidNFTCAIP(wallet) ||
    viem.isAddress(wallet)
  );
};

/**
 * CONVERT A VALID PUSH CAIP TO A VALID PUSH DID
 * @param wallet valid wallet CAIP
 * @param env optional env
 * @param chainId optional chainId
 * @param provider optional provider
 * @returns valid Push DID
 */
export const convertToValidDID = async (
  wallet: string,
  env: ENV = ENV.STAGING,
  signer?: SignerType | null,
  chainId?: number
) => {
  /** @dev Why Not throw error? - Used by Group ChatID also */
  if (!isValidPushCAIP(wallet)) return wallet;
  if (
    isValidEOACAIP(wallet) ||
    isValidSCWCAIP(wallet) ||
    (isValidNFTCAIP(wallet) && wallet.split(':').length === 6)
  )
    return wallet;

  if (isValidNFTCAIP(wallet)) {
    const user = await get({ account: wallet, env: env });
    if (user && user.did) return user.did;
    const epoch = Math.floor(Date.now() / 1000);
    return `${wallet}:${epoch}`;
  }

  if (signer) {
    try {
      const pushSigner = new Signer(signer);
      const isSmartContract = await pushSigner.isSmartContract();
      // check if onChain code exists
      if (isSmartContract) {
        return `scw:eip155:${await pushSigner.getChainId()}:${await pushSigner.getAddress()}`;
      }
    } catch (err) {
      // Ignore if it fails
    }
  }

  return chainId ? `eip155:${chainId}:${wallet}` : `eip155:${wallet}`;
};

/**
 * CHECK IF THE WALLET IS A VALID FULL CAIP10
 * @param wallet eip155:chainId:address
 * @returns boolean
 */
export const isValidFullCAIP10 = (wallet: string) => {
  const walletComponent = wallet.split(':');
  if (isNaN(Number(walletComponent[1]))) return false;
  return (
    walletComponent[0] === 'eip155' &&
    !isNaN(Number(walletComponent[1])) &&
    Number(walletComponent[1]) > 0 &&
    viem.isAddress(walletComponent[2])
  );
};

const AddressValidators: AddressValidatorsType = {
  // Ethereum
  eip155: ({ address }: { address: string }) => {
    return isValidPushCAIP(address);
  },
  // Add other chains here
};

export function validateCAIP(addressInCAIP: string) {
  const [blockchain, networkId, address] = addressInCAIP.split(':');

  if (!blockchain) return false;
  if (!networkId) return false;
  if (!address) return false;

  if (isValidNFTCAIP(addressInCAIP)) return true;

  const validatorFn = AddressValidators[blockchain];

  return validatorFn({ address });
}

export type CAIPDetailsType = {
  blockchain: string;
  networkId: string;
  address: string;
};

export function getCAIPDetails(addressInCAIP: string): CAIPDetailsType | null {
  if (validateCAIP(addressInCAIP)) {
    const [blockchain, networkId, address] = addressInCAIP.split(':');

    return {
      blockchain,
      networkId,
      address,
    };
  }

  return null;
}

export function getFallbackETHCAIPAddress(env: ENV, address: string) {
  let chainId = 1; // by default PROD

  if (
    env === Constants.ENV.DEV ||
    env === Constants.ENV.STAGING ||
    env === Constants.ENV.LOCAL
  ) {
    chainId = 11155111;
  }

  return `eip155:${chainId}:${address}`;
}

/**
 * This helper
 *  checks if a VALID CAIP
 *    return the CAIP
 *  else
 *    check if valid ETH
 *      return a CAIP representation of that address (EIP155 + env)
 *    else
 *      throw error!
 */
export async function getCAIPAddress(env: ENV, address: string, msg?: string) {
  if (isValidNFTCAIP(address)) {
    return await convertToValidDID(address, env);
  }
  if (validateCAIP(address)) {
    return address;
  } else {
    if (isValidPushCAIP(address)) {
      return getFallbackETHCAIPAddress(env, address);
    } else {
      throw Error(`Invalid Address! ${msg} \n Address: ${address}`);
    }
  }
}

export const getCAIPWithChainId = (
  address: string,
  chainId: number,
  msg?: string
) => {
  if (isValidPushCAIP(address)) {
    if (!address.includes('eip155:')) return `eip155:${chainId}:${address}`;
    else return address;
  } else {
    throw Error(`Invalid Address! ${msg} \n Address: ${address}`);
  }
};

// P = Partial CAIP
export const walletToPCAIP10 = (account: string): string => {
  if (isValidNFTCAIP(account) || account.includes('eip155:')) {
    return account;
  }
  return 'eip155:' + account;
};

export const pCAIP10ToWallet = (wallet: string): string => {
  if (isValidNFTCAIP(wallet) || isValidSCWCAIP(wallet)) return wallet;
  wallet = wallet.replace('eip155:', '');
  return wallet;
};
