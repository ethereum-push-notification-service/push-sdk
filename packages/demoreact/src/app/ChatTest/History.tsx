import { useState, useContext } from 'react';
import {
  Section,
  SectionItem,
  CodeFormatter,
  SectionButton,
} from '../components/StyledComponents';
import Loader from '../components/Loader';
import { EnvContext, Web3Context } from '../context';
import * as PushAPI from '@pushprotocol/restapi';
import { walletToPCAIP10 } from '../helpers';
import ChatTest from './ChatTest';

const HistoryTest = () => {
  const { env } = useContext<any>(EnvContext);
  const { account } = useContext<any>(Web3Context);
  const [isLoading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>({});
  const [threadhash, setThreadhash] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);
  const [toDecrypt, setToDecrypt] = useState<boolean>(false);

  const updateToDecrypt = (e: React.SyntheticEvent<HTMLElement>) => {
    setToDecrypt((e.target as HTMLInputElement).checked);
  };
  const updateThreadhash = (e: React.SyntheticEvent<HTMLElement>) => {
    setThreadhash((e.target as HTMLInputElement).value);
  };

  const updateFetchLimit = (e: React.SyntheticEvent<HTMLElement>) => {
    setLimit(parseInt((e.target as HTMLInputElement).value));
  };

  const testHistory = async () => {
    try {
      setLoading(true);

      // object for response
      const user = await PushAPI.user.get({ account: account, env });
      let pvtkey = null;
      if (user?.encryptedPrivateKey) {
        pvtkey = await PushAPI.chat.decryptWithWalletRPCMethod(
          user.encryptedPrivateKey,
          account
        );
      }
      const response = await PushAPI.chat.history({
        threadhash,
        account,
        pgpPrivateKey: pvtkey,
        limit,
        toDecrypt,
        env,
      });

      setResponse(response);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ChatTest />
      <h2>History Test page</h2>

      <Loader show={isLoading} />

      <Section>
        <SectionItem>
          <label>Threadhash</label>
          <input
            type="text"
            onChange={updateThreadhash}
            value={threadhash}
            style={{ width: 400, height: 30 }}
          />
          <label>Fetch Limit</label>
          <input
            type="number"
            onChange={updateFetchLimit}
            value={limit}
            style={{ width: 400, height: 30 }}
          />
          <input
            type="checkbox"
            onChange={updateToDecrypt}
            checked={toDecrypt}
            style={{ width: 20, height: 20 }}
          />
          <label>Decrypt response</label>
          <SectionButton onClick={testHistory}>get history</SectionButton>
        </SectionItem>

        <SectionItem>
          <div>
            {response ? (
              <CodeFormatter>{JSON.stringify(response, null, 4)}</CodeFormatter>
            ) : null}
          </div>
        </SectionItem>
      </Section>
    </div>
  );
};

export default HistoryTest;
