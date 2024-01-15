import { useCallback, useState } from 'react';
import { useChatData } from './useChatData';
import { GroupRolesKeys } from '../../components/chat/types';


interface updateGroupParams {
  chatId:string;
  role: GroupRolesKeys ;
  memberList: Array<string>;
}

const useUpdateGroup = () => {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const { account, env, pushUser } = useChatData();


  const addMember = useCallback(
    async ({ role, memberList,chatId  }: updateGroupParams) => {
      setLoading(true);
      try {
        const response = await pushUser?.chat.group.add(chatId, {
          role: role,
          accounts: memberList,
        });
        return response;
      } catch(error: Error | any) {
        console.log("err", error);
        setError(error.message);
        return error.message;
      }
    },
    [pushUser, env, account]
  )
  const removeMember = useCallback(
    async ({ role, memberList,chatId  }: updateGroupParams) => {
      setLoading(true);
      try {
        const response = await pushUser?.chat.group.remove(chatId, {
          role: role,
          accounts: memberList,
        });
        return response;
      } catch(error: Error | any) {
        console.log("err", error);
        setError(error.message);
        return error.message;
      }
    },
    [pushUser, env, account]
  )

  return { error, loading, addMember,removeMember };
};

export default useUpdateGroup;
