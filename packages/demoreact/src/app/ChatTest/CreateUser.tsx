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
import { ethers } from 'ethers';

type ProgressHookType = {
  progressId: string;
  progressTitle: string,
  progressInfo: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR'
}

const CreateUserTest = () => {
  const { account, library } = useContext<any>(Web3Context);
  const { env, isCAIP } = useContext<any>(EnvContext);
  const [isLoading, setLoading] = useState(false);
  const [connectedUser, setConnectedUser] = useState<any>({});
  const [progress, setProgress] = useState<ProgressHookType | null>(null);

  const handleProgress = (progress: ProgressHookType) => {
    setProgress(progress);
  };


  const testCreateUser = async (index: number) => {
    try {
      setLoading(true);
      let response;
      switch (index) {
        case 0:
          response = await PushAPI.user.create({
            account: isCAIP ? walletToPCAIP10(account) : account,
            env,
            progressHook: handleProgress,
          });
          break;
        case 1: {
          const librarySigner = await library.getSigner();
          response = await PushAPI.user.create({
            signer: librarySigner,
            env,
            progressHook: handleProgress,
          });
        }
          break;
        case 2: {
          const librarySigner = await library.getSigner();
          response = await PushAPI.user.create({
            signer: librarySigner,
            account: account,
            env
          });
        }
          break;
        case 3: {
          const walletPvtKey = '';
          const Pkey = `0x${walletPvtKey}`;
          const pvtKeySigner = new ethers.Wallet(Pkey);
          response = await PushAPI.user.create({
            signer: pvtKeySigner,
            account: account,
            env,
            progressHook: handleProgress,
          });
        }
          break;
        case 4: 
          response = await PushAPI.user.create({
            env,
            progressHook: handleProgress,
          });
          break;
        default:
          break;
      }
      
      setConnectedUser(response);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ChatTest />
      <h2>Create User Test page</h2>

      <Loader show={isLoading} />

      <Section>
        <SectionItem style={{ marginTop: 20 }}>
          <SectionButton onClick={() => testCreateUser(0)}>
            Create user with address
          </SectionButton>
        </SectionItem>
        <SectionItem style={{ marginTop: 20 }}>
          <SectionButton onClick={() => testCreateUser(1)}>
            Create user with library signer
          </SectionButton>
        </SectionItem>
        <SectionItem style={{ marginTop: 20 }}>
          <SectionButton onClick={() => testCreateUser(2)}>
            Create user with address & library signer
          </SectionButton>
        </SectionItem>
        <SectionItem style={{ marginTop: 20 }}>
          <SectionButton onClick={() => testCreateUser(3)}>
            Create user with private key signer
          </SectionButton>
        </SectionItem>
        <SectionItem style={{ marginTop: 20 }}>
          <SectionButton onClick={() => testCreateUser(4)}>
            Create user with nothing (Error expecting)
          </SectionButton>
        </SectionItem>

        {progress && (
          <div>
            <h3>{progress.progressTitle}</h3>
            <p>{progress.progressInfo}</p>
            <p>Level: {progress.level}</p>
          </div>
        )}

        <SectionItem>
          <div>
            {connectedUser ? (
              <CodeFormatter>
                {JSON.stringify(connectedUser, null, 4)}
              </CodeFormatter>
            ) : null}
          </div>
        </SectionItem>
      </Section>
    </div>
  );
};

export default CreateUserTest;
