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

const SendMessageTest = () => {
  const { account } = useContext<any>(Web3Context);
  const { env, isCAIP } = useContext<any>(EnvContext);
  const [isLoading, setLoading] = useState(false);
  const [messageContent, setMessageContent] = useState<string>('');
  const [receiverAddress, setReceiverAddress] = useState<string>('');

  const [sendResponse, setSendResponse] = useState<any>('');

  const updateMessageContent = (e: React.SyntheticEvent<HTMLElement>) => {
    setMessageContent((e.target as HTMLInputElement).value);
  };

  const updateReceiverAddress = (e: React.SyntheticEvent<HTMLElement>) => {
    setReceiverAddress((e.target as HTMLInputElement).value);
  };

  const testSendMessage = async () => {
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
      const response = await PushAPI.chat.send({
        messageContent,
        messageType: 'Text',
        receiverAddress,
        account: isCAIP ? walletToPCAIP10(account) : account,
        pgpPrivateKey: pvtkey,
        env,
      });

      setSendResponse(response);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ChatTest />
      <h2>Send Message Test page</h2>

      <Loader show={isLoading} />

      <Section>
        <SectionItem>
          <div>
            <SectionItem>
              <label>Message Content</label>
              <input
                type="text"
                onChange={updateMessageContent}
                value={messageContent}
                style={{ width: 400, height: 30 }}
              />
            </SectionItem>
            <SectionItem style={{ marginTop: 20 }}>
              <label>Receiver's Address</label>
              <input
                type="text"
                onChange={updateReceiverAddress}
                value={receiverAddress}
                style={{ width: 400, height: 30 }}
              />
            </SectionItem>
            <SectionItem style={{ marginTop: 20 }}>
              <SectionButton onClick={testSendMessage}>
                send message
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

export default SendMessageTest;
