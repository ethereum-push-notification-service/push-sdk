import * as PushAPI from '@pushprotocol/restapi';
import { useCallback, useContext } from 'react';
import { ChatAndNotificationPropsContext } from '../context';
import { Env, IUser } from '@pushprotocol/restapi';

export interface GetProfileParams {
  profileId: string;
  env:Env
}

const useGetChatProfile = () => {
  const fetchChatProfile = useCallback(
    async ({
      profileId,
      env
    }: GetProfileParams): Promise<IUser | undefined> => {
      try {
        const profile = await PushAPI.user.get({
          env: env,
          account: profileId,
        });
        return profile;
      } catch (error) {
        console.log(error);
        return;
      }
    },
    []
  );

  return { fetchChatProfile };
};

export default useGetChatProfile;
