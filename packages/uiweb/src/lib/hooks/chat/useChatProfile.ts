import { Env } from '@pushprotocol/restapi';
import { useCallback } from 'react';
import { useChatData } from './useChatData';


export interface GetProfileParams {
  profileId: string;
  env: Env;
}

const useChatProfile = () => {
const { pushUser } = useChatData();
  const fetchChatProfile = useCallback(
    async ({
      profileId,
      //note: remove env when chat and notification component is shifted to class based
      env
    }: GetProfileParams): Promise<any> => {
      try {
        const userReadOnly = await pushUser!.info({ overrideAccount: profileId });
        return userReadOnly;
      } catch (error) {
        console.log("error", error);
        return;
      }
    },
    []
  );

  return { fetchChatProfile };
};

export default useChatProfile;