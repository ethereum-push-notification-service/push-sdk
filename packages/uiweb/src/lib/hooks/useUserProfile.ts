import { useCallback, useContext } from 'react';
import { Env } from '@pushprotocol/restapi';
import { PushAPI } from "@pushprotocol/restapi";

export interface FetchProfileParams {
  profileId?: string;
  env?: Env;
  user?: PushAPI;
}

const useUserProfile = () => {
  const fetchUserProfile = useCallback(
    async ({
      profileId,
      user,
      //note: remove env when chat and notification component is shifted to class based
      env
    }: FetchProfileParams): Promise<any> => {
      try {
        let userReadOnly;
        
        if(profileId && user)
         userReadOnly = await user!.info({ overrideAccount: profileId });
        else
         userReadOnly = await user!.info();

        return userReadOnly;
      } catch (error) {
        console.log(error);
        return;
      }
    },
    []
  );

  return { fetchUserProfile };
};

export default useUserProfile;
