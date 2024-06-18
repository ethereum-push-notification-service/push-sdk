import { IUser } from '../types';
import { isValidPushCAIP, walletToPCAIP10 } from '../helpers/address';
import { getAPIBaseUrls, verifyProfileKeys } from '../helpers';
import Constants, { ENV } from '../constants';
import { populateDeprecatedUser } from '../utils/populateIUser';
import { axiosPost } from '../utils/axiosUtil';

export interface GetBatchType {
  userIds: string[];
  env?: ENV;
}

export const getBatch = async (options: GetBatchType): Promise<IUser> => {
  const { env = Constants.ENV.PROD, userIds } = options || {};

  const API_BASE_URL = await getAPIBaseUrls(env);
  const requestUrl = `${API_BASE_URL}/v2/users/batch`;

  const MAX_USER_IDS_LENGTH = 100;
  if (userIds.length > MAX_USER_IDS_LENGTH) {
    throw new Error(
      `Too many user IDs. Maximum allowed: ${MAX_USER_IDS_LENGTH}`
    );
  }

  for (let i = 0; i < userIds.length; i++) {
    if (!isValidPushCAIP(userIds[i])) {
      throw new Error(`Invalid user address!`);
    }
  }

  const pcaipUserIds = userIds.map(walletToPCAIP10);
  const requestBody = { userIds: pcaipUserIds };

  return axiosPost(requestUrl, requestBody)
    .then((response) => {
      response.data.users.forEach(async (user: any, index: number) => {
        response.data.users[index].publicKey = await verifyProfileKeys(
          user.encryptedPrivateKey,
          user.publicKey,
          user.did,
          user.caip10,
          user.verificationProof
        );

        response.data.users[index] = populateDeprecatedUser(
          response.data.users[index]
        );
      });
      return response.data;
    })
    .catch((err) => {
      console.error(`[Push SDK] - API ${requestUrl}: `, err);
      throw Error(`[Push SDK] - API ${requestUrl}: ${err}`);
    });
};
