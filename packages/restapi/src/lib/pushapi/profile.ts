import { ProgressHookType } from '../types';
import * as PUSH_USER from '../user';
import { ENV } from '../constants';
import { PushAPI } from './PushAPI';
import { InfoOptions } from './pushAPITypes';
import { LRUCache } from 'lru-cache';

export class Profile {

  constructor(
    private account: string,
    private env: ENV,
    private cache: LRUCache<string, any>,
    private decryptedPgpPvtKey?: string,
    private progressHook?: (progress: ProgressHookType) => void
  ) {}

  async info(options?: InfoOptions) {
    const accountToUse = options?.overrideAccount || this.account;
    const cacheKey = `profile-${accountToUse}`;

    // Check if the profile is already in the cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // If not in cache, fetch from API
    const response = await PUSH_USER.get({
      account: accountToUse,
      env: this.env,
    });
    // Cache the profile data
    this.cache.set(cacheKey, response.profile);
    return response.profile;
  }

  async update(options: { name?: string; desc?: string; picture?: string }) {
    if (!this.decryptedPgpPvtKey) {
      throw new Error(PushAPI.ensureSignerMessage());
    }

    const { name, desc, picture } = options;
    const response = await PUSH_USER.profile.update({
      pgpPrivateKey: this.decryptedPgpPvtKey,
      account: this.account,
      profile: { name, desc, picture },
      env: this.env,
      progressHook: this.progressHook,
    });

    const cacheKey = `profile-${this.account}`;
    this.cache.delete(cacheKey);

    return response.profile;
  }
}
