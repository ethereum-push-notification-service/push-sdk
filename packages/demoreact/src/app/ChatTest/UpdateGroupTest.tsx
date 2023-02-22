import { useState, useContext } from 'react';
import {
  Section,
  SectionItem,
  CodeFormatter,
  SectionButton,
} from '../components/StyledComponents';
import Loader from '../components/Loader';
import { Web3Context, EnvContext } from '../context';
import * as PushAPI from '@pushprotocol/restapi';
import { walletToPCAIP10 } from '../helpers';
import ChatTest from './ChatTest';

const UpdateGroupTest = () => {
  const { account } = useContext<any>(Web3Context);
  const { env, isCAIP } = useContext<any>(EnvContext);
  const [isLoading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string>('');
  const [groupName, setGroupName] = useState<string>('');
  const [groupImage, setGroupImage] = useState<string>('');
  const [groupDescription, setGroupDescription] = useState<string>('');
  const [members, setMembers] = useState<string>('');
  const [admins, setAdmins] = useState<string>('');

  const [sendResponse, setSendResponse] = useState<any>('');

  const updateChatId = (e: React.SyntheticEvent<HTMLElement>) => {
    setChatId((e.target as HTMLInputElement).value);
  };

  const updateGroupName = (e: React.SyntheticEvent<HTMLElement>) => {
    setGroupName((e.target as HTMLInputElement).value);
  };
  const updateGroupDescription = (e: React.SyntheticEvent<HTMLElement>) => {
    setGroupDescription((e.target as HTMLInputElement).value);
  };

  const updateGroupImage= (e: React.SyntheticEvent<HTMLElement>) => {
    setGroupImage((e.target as HTMLInputElement).value);
  };

  const updateMembers= (e: React.SyntheticEvent<HTMLElement>) => {
    setMembers((e.target as HTMLInputElement).value);
  };

 
  const updateAdmins= (e: React.SyntheticEvent<HTMLElement>) => {
    setAdmins((e.target as HTMLInputElement).value);
  };

  const testUpdateGroup = async () => {
    try {
      setLoading(true);
      const user = await PushAPI.user.get({ account: account, env });
      let pvtkey = null;
      if (user?.encryptedPrivateKey) {
        pvtkey = await PushAPI.chat.decryptWithWalletRPCMethod(
          user.encryptedPrivateKey,
          account
        );
      }

      const response = await PushAPI.chat.updateGroup({
        chatId,
        groupName,
        groupImage,
        groupDescription,
        members: members.split(','),
        admins: admins.split(','),
        account: isCAIP ? walletToPCAIP10(account) : account,
        env,
        pgpPrivateKey: pvtkey,
      });

      setSendResponse(response);
    } catch (e:any) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ChatTest />
      <h2>Update Group Test page</h2>

      <Loader show={isLoading} />

      <Section>
        <SectionItem>
          <div>


          <SectionItem>
              <label>chatId</label>
              <input
                type="text"
                onChange={updateChatId}
                value={chatId}
                style={{ width: 400, height: 30 }}
              />
            </SectionItem>

            <SectionItem>
              <label>Group Name</label>
              <input
                type="text"
                onChange={updateGroupName}
                value={groupName}
                style={{ width: 400, height: 30 }}
              />
            </SectionItem>

            <SectionItem>
              <label>Group Description</label>
              <input
                type="text"
                onChange={updateGroupDescription}
                value={groupDescription}
                style={{ width: 400, height: 30 }}
              />
            </SectionItem>

            <SectionItem style={{ marginTop: 20 }}>
              <label>groupImage</label>
              <input
                type="text"
                onChange={updateGroupImage}
                value={groupImage}
                style={{ width: 400, height: 30 }}
              />
            </SectionItem>
        
            <SectionItem style={{ marginTop: 20 }}>
              <label>members</label>
              <input
                type="text"
                onChange={updateMembers}
                value={members}
                style={{ width: 400, height: 30 }}
              />
            </SectionItem>

            <SectionItem style={{ marginTop: 20 }}>
              <label>admins</label>
              <input
                type="text"
                onChange={updateAdmins}
                value={admins}
                style={{ width: 400, height: 30 }}
              />
            </SectionItem>

        
            <SectionItem style={{ marginTop: 20 }}>
              <SectionButton onClick={testUpdateGroup}>
                update group
              </SectionButton>
            </SectionItem>
          </div>
        </SectionItem>

        <SectionItem>
          <div>
            {sendResponse ? (
              <CodeFormatter>
                {JSON.stringify(sendResponse, null, 4)}
              </CodeFormatter>
            ) : null}
          </div>
        </SectionItem>
      </Section>
    </div>
  );
};

export default UpdateGroupTest;
