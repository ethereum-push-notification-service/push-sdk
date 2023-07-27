import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Route, Routes, Link } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import ConnectButton from './components/Connect';
import { Checkbox } from './components/Checkbox';
import Dropdown from './components/Dropdown';
import {
  Web3Context,
  EnvContext,
  SocketContext,
  AccountContext,
} from './context';
import { useSDKSocket } from './hooks';
import { ReactComponent as PushLogo } from '../assets/pushLogo.svg';
import NotificationsTest from './NotificationsTest';
import SecretNotificationsTest from './SecretNotificationsTest';
import ChannelsTest from './ChannelsTest';
import AliasTest from './AliasTest';
import EmbedTest from './EmbedTest';
import PayloadsTest from './PayloadsTest';
import SocketTest from './SocketTest';
import { ChatSupportTest } from './ChatSupportTest';
import ChatTest from './ChatTest/ChatTest';
import GetUserTest from './ChatTest/GetUser';
import CreateUserTest from './ChatTest/CreateUser';
import SendMessageTest from './ChatTest/SendMessageTest';
import ApproveRequestTest from './ChatTest/ApproveRequestTest';
import GetChatsTest from './ChatTest/GetChats';
import ConversationHashTest from './ChatTest/ConversationHash';
import HistoryTest from './ChatTest/History';
import GetRequestsTest from './ChatTest/GetRequests';
import DelegationTest from './DelegationTest';
import CreateGroupTest from './ChatTest/CreateGroupTest';
import AddMembersToGroupTest from './ChatTest/AddMembersToGroupTest';
import AddAdminsToGroupTest from './ChatTest/AddAdminsToGroupTest';
import CreateSpaceTest from './SpaceTest/CreateSpaceTest';
import UpdateSpaceTest from './SpaceTest/UpdateSpaceTest';
import GetSpaceTest from './SpaceTest/GetSpaceTest';
import GetSpaceInfoTest from './SpaceTest/GetSpaceInfoTest';
import ApproveSpaceRequestTest from './SpaceTest/ApproveSpaceRequestTest';
import UpdateGroupTest from './ChatTest/UpdateGroupTest';
import GetGroupTest from './ChatTest/GetGroupTest';
import GetUsersBatchTest from './ChatTest/GetUsersBatchTest';
import AuthUpdateUserTest from './ChatTest/AuthUpdateUser';
import UpdateUserProfile from './ChatTest/UpdateUserProfile';
import { Buffer } from 'buffer';
import { ENV } from './helpers';
import SpaceTest from './SpaceTest/SpaceTest';
import StartSpaceTest from './SpaceTest/StartSpaceTest';
import StopSpaceTest from './SpaceTest/StopSpaceTest';
import RemoveMembersFromGroupTest from './ChatTest/RemoveMembersFromGroupTest';
import RemoveAdminsFromGroupTest from './ChatTest/RemoveAdminsFromGroupTest';
import AddSpeakersToSpaceTest from './SpaceTest/AddSpeakersToSpaceTest';
import AddListenersToSpaceTest from './SpaceTest/AddListenersToSpaceTest';
import RemoveListenersFromSpaceTest from './SpaceTest/RemoveListenersFromSpaceTest';
import RemoveSpeakersFromSpaceTest from './SpaceTest/RemoveSpeakersFromSpaceTest';
import GetSpacesTest from './SpaceTest/GetSpacesTest';
import GetSpacesRequestsTest from './SpaceTest/GetSpacesRequestsTest';
import GetSpacesTrendingTest from './SpaceTest/GetSpacesTrendingTest';
import SpaceUITest from './SpaceUITest/SpaceUITest';
import {
  SpaceWidget,
  SpaceBanner,
  SpaceFeed,
  CreateSpaceComponent,
  SpaceInvitesComponent,
} from './SpaceUITest';
import { useSpaceComponents } from './SpaceUITest/useSpaceComponents';
import * as PushAPI from '@pushprotocol/restapi';
import { ChatWidgetTest } from './ChatWidgetTest';
import { SpacesUI, SpacesUIProvider } from '@pushprotocol/uiweb';

window.Buffer = window.Buffer || Buffer;

interface Web3ReactState {
  chainId?: number;
  account?: string | null | undefined;
  active: boolean;
  error?: Error;
  library?: unknown;
}

const StyledApp = styled.div`
  font-family: 'Source Sans Pro', Arial, sans-serif;

  & .homeLink {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  & h1 {
    text-align: center;
    text-transform: uppercase;
    margin: 20px 0px;
    padding: 0px;
    letter-spacing: 0.1em;
    font-family: 'Source Sans Pro', Helvetica, sans-serif;
    font-weight: 200;
    font-size: 2rem;
    line-height: 1.25em;
  }

  .nav-button {
    align-items: center;
    background-image: linear-gradient(132deg, #574762, #4a36c4 50%, #ee5555);
    border: 0;
    border-radius: 8px;
    box-shadow: rgba(151, 65, 252, 0.2) 0 15px 30px -5px;
    box-sizing: border-box;
    color: #ffffff;
    display: flex;
    font-family: Phantomsans, sans-serif;
    font-size: 20px;
    justify-content: center;
    line-height: 1em;
    max-width: 100%;
    min-width: 140px;
    padding: 19px 24px;
    text-decoration: none;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    white-space: nowrap;
    cursor: pointer;
  }

  .nav-button:hover {
    opacity: 0.8;
  }

  .nav-button:active,
  .nav-button:hover {
    outline: 0;
  }
`;

const NavMenu = styled.div`
  display: flex;
  flex-flow: wrap;
  gap: 30px;
  justify-content: center;

  @media only screen and (max-width: 900px) {
    flex-direction: column;
  }
`;

const customtheme = {
  titleBg: 'linear-gradient(45deg, #E165EC 0.01%, #A483ED 100%)', //not changed
  titleTextColor: '#FFFFFF',
  bgColorPrimary: '#fff',
  bgColorSecondary: '#F7F1FB',
  textColorPrimary: '#000',
  textColorSecondary: '#657795',
  textGradient: 'linear-gradient(45deg, #B6A0F5, #F46EF6, #FFDED3, #FFCFC5)', //not changed
  btnColorPrimary: '#D53A94',
  btnOutline: '#D53A94',
  borderColor: '#FFFF',
  borderRadius: '17px',
  containerBorderRadius: '12px',
  statusColorError: '#E93636',
  statusColorSuccess: '#30CC8B',
  iconColorPrimary: '#82828A',
};

const customDarkTheme = {
  titleBg: 'linear-gradient(87.17deg, #EA4EE4 0%, #D23CDF 0.01%, #8B5CF6 100%)',
  titleTextColor: '#fff',
  bgColorPrimary: '#000',
  bgColorSecondary: '#292344',
  textColorPrimary: '#fff',
  textColorSecondary: '#71717A',
  textGradient: 'linear-gradient(45deg, #B6A0F5, #F46EF6, #FFDED3, #FFCFC5)',
  btnColorPrimary: '#8B5CF6',
  btnOutline: '#8B5CF6',
  borderColor: '#3F3F46',
  borderRadius: '17px',
  containerBorderRadius: '12px',
  statusColorError: '#E93636',
  statusColorSuccess: '#30CC8B',
  iconColorPrimary: '#71717A',
};

const checkForWeb3Data = ({
  library,
  active,
  account,
  chainId,
}: Web3ReactState) => {
  return library && active && account && chainId;
};

export function App() {
  const { account, library, active, chainId } = useWeb3React();

  const [env, setEnv] = useState<ENV>(ENV.DEV);
  const [isCAIP, setIsCAIP] = useState(false);

  const { SpaceWidgetComponent } = useSpaceComponents();
  const [spaceId, setSpaceId] = useState<string>('');
  const [pgpPrivateKey, setPgpPrivateKey] = useState<string>('');

  const socketData = useSDKSocket({
    account: account,
    chainId: chainId,
    env,
    isCAIP,
  });

  const onChangeEnv = (e: any) => {
    setEnv(e.target.value);
  };

  const onChangeCAIP = () => {
    setIsCAIP(!isCAIP);
  };

  useEffect(() => {
    (async () => {
      if (!account || !env || !library) return;

      const user = await PushAPI.user.get({ account: account, env });
      let pgpPrivateKey;
      const librarySigner = await library.getSigner(account);
      if (user?.encryptedPrivateKey) {
        pgpPrivateKey = await PushAPI.chat.decryptPGPKey({
          encryptedPGPPrivateKey: user.encryptedPrivateKey,
          account: account,
          signer: librarySigner,
          env,
        });
      }

      setPgpPrivateKey(pgpPrivateKey);
    })();
  }, [account, env, library]);

  const spaceUI = useMemo(
    () =>
      new SpacesUI({
        account: account as string,
        signer: library?.getSigner(),
        pgpPrivateKey: pgpPrivateKey,
        env: env,
      }),
    [account, library, pgpPrivateKey, env]
  );

  return (
    <StyledApp>
      <Link className="homeLink" to="/">
        <PushLogo style={{ marginRight: 12 }} />
        <h1>SDK Demo React App</h1>
      </Link>

      <ConnectButton />

      <Dropdown
        label="ENV"
        options={[
          { label: 'prod', value: 'prod' },
          { label: 'staging', value: 'staging' },
          { label: 'dev', value: 'dev' },
        ]}
        value={env}
        onChange={onChangeEnv}
      />

      <div style={{ marginTop: 10 }}>
        <Checkbox
          id="isCAIP"
          label="Convert to CAIP"
          value={isCAIP}
          onChange={onChangeCAIP}
        />
      </div>

      <hr />
      <EnvContext.Provider value={{ env, isCAIP }}>
        {checkForWeb3Data({
          active,
          account,
          library,
          chainId,
        }) ? (
          <Web3Context.Provider value={{ account, active, library, chainId }}>
            <SocketContext.Provider value={socketData}>
              <AccountContext.Provider value={{ pgpPrivateKey, setSpaceId }}>
                <SpacesUIProvider spaceUI={spaceUI} theme={customDarkTheme}>
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <NavMenu>
                          <Link to="/notifications" className="nav-button">
                            NOTIFICATIONS
                          </Link>
                          <Link to="/secret" className="nav-button">
                            SECRET NOTIFICATION
                          </Link>
                          <Link to="/channels" className="nav-button">
                            CHANNELS
                          </Link>
                          <Link to="/alias" className="nav-button">
                            ALIAS
                          </Link>
                          <Link to="/delegations" className="nav-button">
                            DELEGATIONS
                          </Link>
                          <Link to="/payloads" className="nav-button">
                            PAYLOADS
                          </Link>
                          <Link to="/socket" className="nav-button">
                            SOCKET
                          </Link>
                          <Link to="/embed" className="nav-button">
                            EMBED
                          </Link>
                          <Link to="/chat" className="nav-button">
                            CHAT
                          </Link>
                          <Link to="/space" className="nav-button">
                            SPACE
                          </Link>
                          <Link to="/spaceUI" className="nav-button">
                            SPACE UI
                          </Link>
                        </NavMenu>
                      }
                    />
                    <Route
                      path="/notifications"
                      element={<NotificationsTest />}
                    />
                    <Route
                      path="/secret"
                      element={<SecretNotificationsTest />}
                    />

                    <Route path="/channels" element={<ChannelsTest />} />

                    <Route path="/alias" element={<AliasTest />} />

                    <Route path="/delegations" element={<DelegationTest />} />

                    <Route path="/payloads" element={<PayloadsTest />} />

                    <Route path="/socket" element={<SocketTest />} />

                    <Route path="/embed" element={<EmbedTest />} />

                    <Route path="/chat" element={<ChatTest />} />
                    <Route path="/space" element={<SpaceTest />} />

                    <Route path="/spaceUI" element={<SpaceUITest />} />

                    {/* chat method  routes */}
                    <Route path="/get" element={<GetUserTest />} />
                    <Route
                      path="/getUsersBatch"
                      element={<GetUsersBatchTest />}
                    />
                    <Route path="/create" element={<CreateUserTest />} />
                    <Route
                      path="/updateUserprofile"
                      element={<UpdateUserProfile />}
                    />
                    <Route
                      path="/authUpdate"
                      element={<AuthUpdateUserTest />}
                    />
                    <Route path="/send" element={<SendMessageTest />} />
                    <Route path="/approve" element={<ApproveRequestTest />} />
                    <Route path="/chats" element={<GetChatsTest />} />
                    <Route path="/hash" element={<ConversationHashTest />} />
                    <Route path="/history" element={<HistoryTest />} />
                    <Route path="/requests" element={<GetRequestsTest />} />
                    <Route path="/createGroup" element={<CreateGroupTest />} />
                    <Route path="/getGroup" element={<GetGroupTest />} />
                    <Route
                      path="/addMembersToGroup"
                      element={<AddMembersToGroupTest />}
                    />
                    <Route
                      path="/addAdminsToGroup"
                      element={<AddAdminsToGroupTest />}
                    />
                    <Route
                      path="/removeMembersFromGroup"
                      element={<RemoveMembersFromGroupTest />}
                    />
                    <Route
                      path="/removeAdminsFromGroup"
                      element={<RemoveAdminsFromGroupTest />}
                    />
                    <Route path="/updateGroup" element={<UpdateGroupTest />} />

                    {/* spaces method  routes */}
                    <Route path="/createSpace" element={<CreateSpaceTest />} />
                    <Route path="/updateSpace" element={<UpdateSpaceTest />} />
                    <Route path="/getSpace" element={<GetSpaceTest />} />
                    <Route
                      path="/getSpaceInfo"
                      element={<GetSpaceInfoTest />}
                    />
                    <Route
                      path="/approveSpace"
                      element={<ApproveSpaceRequestTest />}
                    />
                    <Route path="/startSpace" element={<StartSpaceTest />} />
                    <Route path="/stopSpace" element={<StopSpaceTest />} />
                    <Route
                      path="/addSpeakersToSpace"
                      element={<AddSpeakersToSpaceTest />}
                    />
                    <Route
                      path="/addListenersToSpace"
                      element={<AddListenersToSpaceTest />}
                    />
                    <Route
                      path="/removeListenersFromSpace"
                      element={<RemoveListenersFromSpaceTest />}
                    />
                    <Route
                      path="/removeSpeakersFromSpace"
                      element={<RemoveSpeakersFromSpaceTest />}
                    />
                    <Route path="/getSpaces" element={<GetSpacesTest />} />
                    <Route
                      path="/getSpacesRequests"
                      element={<GetSpacesRequestsTest />}
                    />
                    <Route
                      path="/getSpacesTrending"
                      element={<GetSpacesTrendingTest />}
                    />

                    {/* spaces ui components routes */}
                    <Route path="spaceWidget" element={<SpaceWidget />} />
                    <Route path="spaceFeed" element={<SpaceFeed />} />
                    <Route path="spaceBanner" element={<SpaceBanner />} />
                    <Route
                      path="spaceInvites"
                      element={<SpaceInvitesComponent />}
                    />
                    <Route
                      path="createSpaceUI"
                      element={<CreateSpaceComponent />}
                    />
                  </Routes>
                  {/* <ChatWidgetTest/> */}
                  <ChatWidgetTest />
                  <SpaceWidgetComponent spaceId={spaceId} />
                </SpacesUIProvider>
              </AccountContext.Provider>
            </SocketContext.Provider>
          </Web3Context.Provider>
        ) : null}
      </EnvContext.Provider>
    </StyledApp>
  );
}

export default App;
