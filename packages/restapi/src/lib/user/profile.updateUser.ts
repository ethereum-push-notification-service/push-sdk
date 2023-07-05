import axios from 'axios';
import * as CryptoJS from 'crypto-js';
import { getUserDID, sign } from '../chat/helpers';
import Constants, { ENV } from '../constants';
import {
  getAPIBaseUrls,
  isValidETHAddress,
  verifyPGPPublicKey,
} from '../helpers';
import { IUser, ProgressHookType, ProgressHookTypeFunction } from '../types';
import { get } from './getUser';
import { populateDeprecatedUser } from '../utils/populateIUser';
import PROGRESSHOOK from '../progressHook';

type ProfileUpdateProps = {
  /**
   * PGP Private Key
   */
  pgpPrivateKey: string;
  /**
   * DID
   */
  account: string;
  /**
   *  Profile properties that can be changed
   */
  profile: {
    name?: string;
    desc?: string;
    picture?: string;
    blockedUsersList?: Array<string>;
  };
  env?: ENV;
  progressHook?: (progress: ProgressHookType) => void;
};

/**
 * Updation of profile
 */
export const profileUpdate = async (
  options: ProfileUpdateProps
): Promise<IUser> => {
  const {
    pgpPrivateKey,
    account,
    profile,
    env = Constants.ENV.PROD,
    progressHook,
  } = options || {};
  try {
    if (!isValidETHAddress(account)) {
      throw new Error(`Invalid account!`);
    }

    const user = await get({ account, env });
    if (!user || !user.did) {
      throw new Error('User not Found!');
    }
    let blockedUsersList = null;
    if(profile.blockedUsersList ){

      for (const element of profile.blockedUsersList ) {
        // Check if the element is a valid CAIP-10 address
        if (!isValidETHAddress(element)) {
          throw new Error('Invalid address in the blockedUsersList: ' + element);
        }
      }

      const convertedBlockedListUsersPromise = profile.blockedUsersList.map(async (each) => {
        return getUserDID(each, env);
      });
      blockedUsersList = await Promise.all(convertedBlockedListUsersPromise);
    }

    const updatedProfile = {
      name: profile.name ? profile.name : user.profile.name,
      desc: profile.desc ? profile.desc : user.profile.desc,
      picture: profile.picture ? profile.picture : user.profile.picture,
      // If profile.blockedUsersList is empty no users in block list
      blockedUsersList: profile.blockedUsersList ? blockedUsersList : [] 
    };
    const hash = CryptoJS.SHA256(JSON.stringify(updatedProfile)).toString();
    const signature = await sign({
      message: hash,
      signingKey: pgpPrivateKey,
    });
    const sigType = 'pgpv2';
    const verificationProof = `${sigType}:${signature}`;

    const body = { ...updatedProfile, verificationProof };

    const API_BASE_URL = getAPIBaseUrls(env);
    const apiEndpoint = `${API_BASE_URL}/v2/users/${user.did}/profile`;

    // Report Progress
    progressHook?.(PROGRESSHOOK['PUSH-PROFILE-UPDATE-01'] as ProgressHookType);
    const response = await axios.put(apiEndpoint, body);
    if (response.data)
      response.data.publicKey = verifyPGPPublicKey(
        response.data.encryptedPrivateKey,
        response.data.publicKey,
        response.data.did
      );

    // Report Progress
    progressHook?.(PROGRESSHOOK['PUSH-PROFILE-UPDATE-02'] as ProgressHookType);
    return populateDeprecatedUser(response.data);
  } catch (err) {
    // Report Progress
    const errorProgressHook = PROGRESSHOOK[
      'PUSH-ERROR-00'
    ] as ProgressHookTypeFunction;
    progressHook?.(errorProgressHook(profileUpdate.name, err));
    throw Error(
      `[Push SDK] - API - Error - API ${profileUpdate.name} -: ${err}`
    );
  }
};
