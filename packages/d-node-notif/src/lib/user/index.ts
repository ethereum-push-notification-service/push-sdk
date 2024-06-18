import { authUpdate } from './auth.updateUser';
import { profileUpdate, profileUpdateCore } from './profile.updateUser';
export type { ProfileUpdateProps } from './profile.updateUser';
export * from './createUser';
export * from './getFeeds';
export * from './getSubscriptions';
export * from './getUser';
export * from './getDelegations';
export * from './getUsersBatch';
export * from './upgradeUser';
export * from './decryptAuth';
export * from './createUserWithProfile';
export * from './getFeedsPerChannel';

export const auth = {
  update: authUpdate,
};
export const profile = {
  update: profileUpdate,
  updateCore: profileUpdateCore,
};
