
import { useCallback, useState } from 'react';
import { useChatData } from './useChatData';

interface HistoryMessagesParams {
  chatId?: string;
  limit?: number;
  threadHash?: string | null;
}


const useFetchHistoryMessages
  = () => {
    const [error, setError] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);

    const { account, env, pushUser, signer } = useChatData();

    const historyMessages = useCallback(async ({ chatId, limit = 10, threadHash }: HistoryMessagesParams) => {
      setLoading(true);
      try {
        const chatHistory = await pushUser?.chat.history(chatId ? chatId : "", {
          limit: limit,
          reference: threadHash,
        })
        chatHistory?.reverse();
        return chatHistory;
      } catch (error: Error | any) {
        setLoading(false);
        setError(error.message);
        console.log(error);
        return;
      } finally {
        setLoading(false);
      }
    }, [account, env, pushUser, signer]);

    return { historyMessages, error, loading };
  };

export default useFetchHistoryMessages;
