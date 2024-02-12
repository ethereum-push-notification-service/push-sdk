import * as viem from 'viem';
import Constants, {ENV} from '../constants';
import { getUserDID } from '../chat/helpers';

export interface AddressValidatorsType {
  [key: string]: ({ address } : { address: string }) => boolean;
}

export function isValidETHAddress(address: string) {
  if(isValidCAIP10NFTAddress(address))return true;
  if (address.includes('eip155:')) {
    const splittedAddress = address.split(':');
    if(splittedAddress.length === 3){
     return viem.isAddress(splittedAddress[2]);
    }
    if(splittedAddress.length === 2)
     return viem.isAddress(splittedAddress[1]); 
  }
  return viem.isAddress(address);
}

export function  isValidNFTCAIP10Address (realCAIP10: string)  {
        const walletComponent = realCAIP10.split(':');
        if (isNaN(Number(walletComponent[1]))) return false
        return (walletComponent.length === 3 && walletComponent[0] === 'eip155' && viem.isAddress(walletComponent[2]))
}

/**
 * 
 * @param wallet nft:eip155:nftChainId:nftContractAddress:nftTokenId
 * @returns 
 */
export const isValidCAIP10NFTAddress = (wallet: string): boolean => {
  try {
    const walletComponent = wallet.split(':');
    return (
      (walletComponent.length === 5 || walletComponent.length === 6)&&
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

const AddressValidators: AddressValidatorsType = {
  // Ethereum
  'eip155': ({ address } : { address: string }) => {
    return isValidETHAddress(address);
  }
  // Add other chains here
};

export function validateCAIP(addressInCAIP: string) {
  const [
    blockchain,
    networkId,
    address
  ] = addressInCAIP.split(':');

  if (!blockchain) return false;
  if (!networkId) return false;
  if (!address) return false;

  if(isValidCAIP10NFTAddress(addressInCAIP))return true;

  const validatorFn = AddressValidators[blockchain];

  return validatorFn({ address });
}

export type CAIPDetailsType = {
  blockchain: string;
  networkId: string;
  address: string;
};

export function getCAIPDetails(addressInCAIP: string) : CAIPDetailsType | null {
  if (validateCAIP(addressInCAIP)) {
    const [
      blockchain,
      networkId,
      address
    ] = addressInCAIP.split(':');

    return {
      blockchain,
      networkId,
      address
    };
  }

  return null;
}

export function getFallbackETHCAIPAddress(env: ENV, address: string) {
  let chainId = 1; // by default PROD

  if (env === Constants.ENV.DEV || env === Constants.ENV.STAGING || env === Constants.ENV.LOCAL) {
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
  if(isValidCAIP10NFTAddress(address)){
    return await getUserDID(address, env);
  }
  if (validateCAIP(address)) {
    return address;
  } else {
    if (isValidETHAddress(address)) {
      return getFallbackETHCAIPAddress(env, address);
    } else {
      throw Error(`Invalid Address! ${msg} \n Address: ${address}`);
    }
  }
}

export const getCAIPWithChainId = (address:string, chainId:number, msg?: string) => {
  if(isValidETHAddress(address)) {
    if(!address.includes('eip155:'))
     return `eip155:${chainId}:${address}`;
    else
     return address;
  } else {
    throw Error(`Invalid Address! ${msg} \n Address: ${address}`);
  }
}

// P = Partial CAIP
export const walletToPCAIP10 = (account:string): string => {
  if(isValidCAIP10NFTAddress(account) || account.includes('eip155:')){
    return account
  }
  return 'eip155:' + account
}

export const pCAIP10ToWallet = (wallet: string): string => {
  if(isValidCAIP10NFTAddress(wallet))return wallet;
  wallet = wallet.replace('eip155:', '')
  return wallet
}