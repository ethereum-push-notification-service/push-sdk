import * as PushAPI from '@pushprotocol/restapi';
import { useCallback, useContext, useState } from 'react';
import { useChatData } from './useChatData';

interface ApproveChatParams {
  chatId: string;
}

const useApproveChatRequest = () => {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const { account, env,signer, pushUser } =useChatData();
  const approveChatRequest = useCallback(async (options:ApproveChatParams) => {
    const {

        chatId,
      } = options || {};
      setLoading(true);
      try {
        const response = await pushUser?.chat.accept(chatId);
        setLoading(false);
        return response;
      } catch (error: Error | any) {
        setLoading(false);
        setError(error.message);
        console.log(error);
        return;
      }
    },

    [account,env,signer,pushUser]

  );

  return { approveChatRequest, error, loading };
};

export default useApproveChatRequest;
