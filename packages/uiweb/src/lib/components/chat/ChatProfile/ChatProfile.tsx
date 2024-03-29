// @typescript-eslint/no-non-null-asserted-optional-chain

import { useContext, useEffect, useRef, useState } from 'react';

import styled from 'styled-components';
import type { IUser } from '@pushprotocol/restapi';
import { ethers } from 'ethers';
import { ToastContainer } from 'react-toastify';

import { Image, Section, Span } from '../../reusables';
import { useChatData, useClickAway } from '../../../hooks';
import { ThemeContext } from '../theme/ThemeProvider';
import useGetGroupByIDnew from '../../../hooks/chat/useGetGroupByIDnew';
import useChatProfile from '../../../hooks/chat/useChatProfile';
import { GroupInfoModal } from './GroupInfoModal';
import useMediaQuery from '../../../hooks/useMediaQuery';
import { createBlockie } from '../../space/helpers/blockies';
import { ProfileContainer } from '../reusables';
import 'react-toastify/dist/ReactToastify.min.css';
import { Group, IChatProfile } from '../exportedTypes';
import { MODAL_BACKGROUND_TYPE, MODAL_POSITION_TYPE } from '../../../types';

import {
  CoreContractChainId,
  InfuraAPIKey,
  allowedNetworks,
  device,
} from '../../../config';
import { getAddress, resolveNewEns, shortenText } from '../../../helpers';
import { formatAddress, isValidETHAddress } from '../helpers/helper';
import PublicChatIcon from '../../../icons/Public-Chat.svg';
import GreyImage from '../../../icons/greyImage.png';
import InfoIcon from '../../../icons/infodark.svg';
import VerticalEllipsisIcon from '../../../icons/VerticalEllipsis.svg';
import { TokenGatedSvg } from '../../../icons/TokenGatedSvg';
import useUserProfile from '../../../hooks/useUserProfile';

export const ChatProfile: React.FC<IChatProfile> = ({
  chatId,
  groupInfoModalBackground = MODAL_BACKGROUND_TYPE.OVERLAY,
  groupInfoModalPositionType = MODAL_POSITION_TYPE.GLOBAL,
  chatProfileRightHelperComponent = null,
  chatProfileLeftHelperComponent = null,
}) => {
  const theme = useContext(ThemeContext);
  const { account, env, user } = useChatData();
  const { getGroupByIDnew } = useGetGroupByIDnew();
  const { fetchUserProfile } = useUserProfile();

  // const [isGroup, setIsGroup] = useState<boolean>(false);
  const [options, setOptions] = useState(false);
  const [chatInfo, setChatInfo] = useState<IUser | null>();
  const [groupInfo, setGroupInfo] = useState<Group | null>();
  const [web3Name, setWeb3Name] = useState<string | null>(null);
  const isMobile = useMediaQuery(device.tablet);
  const provider = new ethers.providers.InfuraProvider(
    CoreContractChainId[env],
    InfuraAPIKey
  );
  const DropdownRef = useRef(null);
  const [modal, setModal] = useState(false);

  useClickAway(DropdownRef, () => {
    setOptions(false);
  });

  const ShowModal = () => {
    setModal(true);
  };

  const fetchProfileData = async () => {
    let formattedChatId;
    if (chatId.includes('eip155:')) {
      formattedChatId = chatId.replace('eip155:', '');
    } else if (chatId.includes('.')) {
      formattedChatId = (await getAddress(chatId, env))!;
    } else formattedChatId = chatId;
    if (isValidETHAddress(formattedChatId)) {
      const ChatProfile = await fetchUserProfile({
        profileId: formattedChatId,
        env,
        user,
      });
      const result = await resolveNewEns(formattedChatId, provider, env);
      setWeb3Name(result);
      setChatInfo(ChatProfile);
      setGroupInfo(null);
      // setIsGroup(false);
    } else {
      const GroupProfile = await getGroupByIDnew({ groupId: formattedChatId });
      setGroupInfo(GroupProfile);
      setChatInfo(null);
      setWeb3Name(null);
      // setIsGroup(true);
    }
  };

  const getImage = () => {
    if (chatInfo || groupInfo) {
      return Object.keys(groupInfo || {}).length
        ? groupInfo?.groupImage ?? GreyImage
        : chatInfo?.profile?.picture ??
            createBlockie?.(chatId)?.toDataURL()?.toString();
    } else {
      return createBlockie?.(chatId)?.toDataURL()?.toString();
    }
  };

  const getProfileName = () => {
    return Object.keys(groupInfo || {}).length
      ? shortenText(groupInfo?.chatId || '', 6, true)
      : chatInfo
      ? shortenText(chatInfo.did?.split(':')[1] ?? '', 6, true)
      : shortenText(chatId?.split(':')[1], 6, true);
  };
  useEffect(() => {
    if (!chatId) return;
    fetchProfileData();
  }, [chatId, account, user]);

  if (chatId) {
    return (
      <Container theme={theme}>
        <Section gap="10px">
          {chatProfileLeftHelperComponent && (
            <Section
              cursor="pointer"
              maxHeight="1.75rem"
              width="1.75rem"
              maxWidth="1.75rem"
              minWidth="1.75rem"
              overflow="hidden"
              justifyContent="center"
              alignSelf="center"
            >
              {chatProfileLeftHelperComponent}
            </Section>
          )}
          <ProfileContainer
            theme={theme}
            member={{
              wallet: getProfileName() as string,
              image: getImage(),
              web3Name: web3Name?web3Name:groupInfo?.groupName,
              completeWallet:chatInfo?.wallets??groupInfo?.chatId
            }}
            copy={!!chatInfo|| !!groupInfo}
            customStyle={{
              fontSize: theme?.fontWeight?.chatProfileText,
              textColor: theme?.textColor?.chatProfileText,
            }}
            
          />
        </Section>
        <Section
          zIndex="unset"
          flexDirection="row"
          gap="10px"
          margin="0 20px 0 auto"
          alignSelf="center"
        >
          {chatProfileRightHelperComponent && !groupInfo && (
            <Section
              cursor="pointer"
              maxHeight="1.75rem"
              width="1.75rem"
              maxWidth="1.75rem"
              minWidth="1.75rem"
              overflow="hidden"
            >
              {chatProfileRightHelperComponent}
            </Section>
          )}
          {!!Object.keys(groupInfo?.rules || {}).length && <TokenGatedSvg />}
          {!!groupInfo?.isPublic && (
            <Image
              src={PublicChatIcon}
              height="28px"
              maxHeight="32px"
              width={'auto'}
            />
          )}

          {!!Object.keys(groupInfo || {}).length && (
            <ImageItem onClick={() => setOptions(true)}>
              <Image
                src={VerticalEllipsisIcon}
                height="21px"
                maxHeight="32px"
                width={'auto'}
                cursor="pointer"
              />

              {options && (
                <DropDownBar theme={theme} ref={DropdownRef}>
                  <DropDownItem cursor="pointer" onClick={ShowModal}>
                    <Image
                      src={InfoIcon}
                      height="21px"
                      maxHeight="21px"
                      width={'auto'}
                      cursor="pointer"
                    />

                    <TextItem cursor="pointer">Group Info</TextItem>
                  </DropDownItem>
                </DropDownBar>
              )}
            </ImageItem>
          )}
        </Section>
        {modal && (
          <GroupInfoModal
            theme={theme}
            setModal={setModal}
            groupInfo={groupInfo!}
            setGroupInfo={setGroupInfo}
            groupInfoModalBackground={groupInfoModalBackground}
            groupInfoModalPositionType={groupInfoModalPositionType}
          />
        )}
        {/* {!isGroup && 
                    <VideoChatSection>
                        <Image src={VideoChatIcon} height="18px" maxHeight="18px" width={'auto'} />
                    </VideoChatSection>
                    } */}

        <ToastContainer />
      </Container>
    );
  } else {
    return null;
  }
};

const Container = styled.div`
  width: 100%;
  background: ${(props) => props.theme.backgroundColor.chatProfileBackground};
  border: ${(props) => props.theme.border?.chatProfile};
  border-radius: ${(props) => props.theme.borderRadius?.chatProfile};
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 6px;
  box-sizing: border-box;
`;

const ImageItem = styled.div`
  position: relative;
`;

const DropDownBar = styled.div`
  position: absolute;
  top: 30px;
  left: -130px;
  cursor: pointer;
  display: block;
  min-width: 140px;
  color: rgb(101, 119, 149);
  background: ${(props) => props.theme.backgroundColor.modalBackground};
  border: ${(props) => props.theme.border.modalInnerComponents};
  z-index: 10;
  border-radius: ${(props) => props.theme.borderRadius.modalInnerComponents};
`;

const VideoChatSection = styled.div`
  margin: 0 25px 0 auto;
`;

const DropDownItem = styled(Span)`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 16px;
  z-index: 3000000;
  width: 100%;
`;

const TextItem = styled(Span)`
  white-space: nowrap;
  overflow: hidden;
`;

//auto update members when an user accepts not done
