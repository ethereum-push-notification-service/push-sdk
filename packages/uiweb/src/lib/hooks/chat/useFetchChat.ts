import * as PushAPI from '@pushprotocol/restapi';
import { useCallback, useState } from 'react';
import { useChatData } from './useChatData';
import { GUEST_MODE_ACCOUNT } from '../../config';


interface fetchChat {
  chatId?: string;
}

const useFetchChat = () => {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const { account, env, pushUser } = useChatData();

  const fetchChat = useCallback(
    async ({ chatId}: fetchChat) => {
      setLoading(true);
      try {
        console.log(account)
        const chat = await PushAPI.chat.chat({
          account: account? account : GUEST_MODE_ACCOUNT,
          toDecrypt: false,
          pgpPrivateKey: '',
          recipient: chatId!,
          env: env
        });
        console.log(chat)
        return chat;
      } catch (error: Error | any) {
        setLoading(false);
        setError(error.message);
        console.log(error);
        return;
      }
      finally {
        setLoading(false);
      }
    },
    [env,account, pushUser]
  );

  return { fetchChat, error, loading };
};

export default useFetchChat;
