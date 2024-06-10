import Constants, { ENV } from '../../constants';
import {
  generateHash,
  getAPIBaseUrls,
  getQueryParams,
  isValidNFTCAIP,
  verifyProfileKeys,
  walletToPCAIP10,
} from '../../helpers';
import {
  AccountEnvOptionsType,
  ConversationHashOptionsType,
  walletType,
} from '../../types';
import { getEip191Signature } from './crypto';
import { populateDeprecatedUser } from '../../utils/populateIUser';
import { axiosGet, axiosPost, axiosPut } from '../../utils/axiosUtil';

type CreateUserOptionsType = {
  user: string;
  wallet?: walletType;
  publicKey?: string;
  encryptedPrivateKey?: string;
  env?: ENV;
  origin?: string | null;
};

export const createUserService = async (options: CreateUserOptionsType) => {
  const {
    wallet,
    publicKey = '',
    encryptedPrivateKey = '',
    env = Constants.ENV.PROD,
    origin,
  } = options || {};
  let { user } = options || {};

  const API_BASE_URL = getAPIBaseUrls(env);

  const requestUrl = `${API_BASE_URL}/v2/users/`;

  if (isValidNFTCAIP(user)) {
    const epoch = Math.floor(Date.now() / 1000);
    if (user.split(':').length !== 6) {
      user = `${user}:${epoch}`;
    } else {
      user = user.split(':').slice(0, -1).join(':') + `:${epoch}`;
    }
  }
  const data = {
    caip10: walletToPCAIP10(user),
    did: walletToPCAIP10(user),
    publicKey,
    encryptedPrivateKey,
  };

  const hash = generateHash(data);

  const signatureObj = await getEip191Signature(wallet!, hash, 'v2');

  const body = {
    ...data,
    origin: origin,
    ...signatureObj,
  };

  return axiosPost(requestUrl, body)
    .then(async (response) => {
      if (response.data)
        response.data.publicKey = await verifyProfileKeys(
          response.data.encryptedPrivateKey,
          response.data.publicKey,
          response.data.did,
          response.data.wallets,
          response.data.verificationProof
        );
      return populateDeprecatedUser(response.data);
    })
    .catch((err) => {
      throw Error(`[Push SDK] - API ${requestUrl}: ${err}`);
    });
};

export const authUpdateUserService = async (options: CreateUserOptionsType) => {
  const {
    user,
    wallet,
    publicKey = '',
    encryptedPrivateKey = '',
    env = Constants.ENV.PROD,
  } = options || {};

  const API_BASE_URL = getAPIBaseUrls(env);

  const requestUrl = `${API_BASE_URL}/v2/users/${walletToPCAIP10(user)}/auth`;

  const data = {
    caip10: walletToPCAIP10(user),
    did: walletToPCAIP10(user),
    publicKey,
    encryptedPrivateKey,
  };

  const hash = generateHash(data);

  const signatureObj = await getEip191Signature(wallet!, hash, 'v2');

  // Exclude the "did" property from the "body" object
  const { did, ...body } = { ...data, ...signatureObj };

  return axiosPut(requestUrl, body)
    .then(async (response) => {
      if (response.data)
        response.data.publicKey = await verifyProfileKeys(
          response.data.encryptedPrivateKey,
          response.data.publicKey,
          response.data.did,
          response.data.wallets,
          response.data.verificationProof
        );
      return populateDeprecatedUser(response.data);
    })
    .catch((err) => {
      throw Error(`[Push SDK] - API ${requestUrl}: ${err}`);
    });
};

export const getConversationHashService = async (
  options: ConversationHashOptionsType
): Promise<{ threadHash: string; intent: boolean }> => {
  const { conversationId, account, env = Constants.ENV.PROD } = options || {};

  const API_BASE_URL = getAPIBaseUrls(env);

  const requestUrl = `${API_BASE_URL}/v1/chat/users/${walletToPCAIP10(
    account
  )}/conversations/${conversationId}/hash`;

  return axiosGet(requestUrl)
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      throw new Error(err);
    });
};

export interface GetMessagesOptionsType
  extends Omit<AccountEnvOptionsType, 'account'> {
  threadhash: string;
  limit: number;
}

export const getMessagesService = async (options: GetMessagesOptionsType) => {
  const { threadhash, limit, env = Constants.ENV.PROD } = options || {};

  const API_BASE_URL = getAPIBaseUrls(env);
  const apiEndpoint = `${API_BASE_URL}/v1/chat/conversationhash/${threadhash}`;
  const queryObj = {
    fetchLimit: limit,
  };

  const requestUrl = `${apiEndpoint}?${getQueryParams(queryObj)}`;

  return axiosGet(requestUrl)
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      throw new Error(err);
    });
};
