import { useContext, useState } from 'react';

import styled from 'styled-components';
import { ChatMemberProfile, IUser } from '@pushprotocol/restapi';
import { MdError } from 'react-icons/md';

import { ThemeContext } from '../theme/ThemeProvider';
import { useChatData } from '../../../hooks';
import { Spinner } from '../../supportChat/spinner/Spinner';
import { MoreDarkIcon } from '../../../icons/MoreDark';
import { Section, Span, Image } from '../../reusables/sharedStyling';
import { AddUserDarkIcon } from '../../../icons/Adddark';
import { MemberListContainer } from './MemberListContainer';
import useMediaQuery from '../../../hooks/useMediaQuery';
import useToast from '../reusables/NewToast';

import { getNewChatUser } from '../../../helpers';
import { Group, IChatTheme, ModalButtonProps } from '../exportedTypes';
import { device } from '../../../config';
import {
  ChatSearchInput,
  CustomStyleParamsType,
  ModalHeader,
} from '../reusables';
import useChatProfile from '../../../hooks/chat/useChatProfile';
import useUserProfile from '../../../hooks/useUserProfile';

type AddWalletProps = {
  onSubmit: () => void;
  onClose: () => void;
  addMemberToList: (member: IUser) => Promise<void>;
  handlePrevious: () => void;
  memberList: any;
  totalAllowedMembers: number;
  handleMemberList: any;
  groupMembers?: ChatMemberProfile[];
  isLoading?: boolean;
  title: string;
  submitButtonTitle: string;
};
export const AddWallets = ({
  onSubmit,
  handlePrevious,
  onClose,
  memberList,
  handleMemberList,
  groupMembers,
  totalAllowedMembers,
  isLoading,
  title,
  addMemberToList,
  submitButtonTitle,
}: AddWalletProps) => {
  const theme = useContext(ThemeContext);

  const [filteredUserData, setFilteredUserData] = useState<any>(null);
  const { env,user } = useChatData();
  const isMobile = useMediaQuery(device.mobileL);
  const { fetchUserProfile } = useUserProfile();
  const groupInfoToast = useToast();
  const customSearchStyle: CustomStyleParamsType = {
    background: theme.backgroundColor?.modalInputBackground,
    border: theme.border?.modalInnerComponents,
    placeholderColor: theme.textColor?.modalSubHeadingText,
    fontSize: '15px',
    fontWeight: '400',
  };

  const handleSearch = async ({
    searchedText,
  }: {
    searchedText: string;
  }): Promise<void> => {
    //fix ens search
    const newChatUser = await getNewChatUser({
      searchText: searchedText,
      fetchChatProfile:fetchUserProfile,
      env,
      user
    });
    if (newChatUser) {
      setFilteredUserData(newChatUser);
    } else {
      groupInfoToast.showMessageToast({
        toastTitle: 'Error',
        toastMessage: 'Invalid Address',
        toastType: 'ERROR',
        getToastIcon: (size) => <MdError size={size} color="red" />,
      });
    }
  };

  const clearInput = () => {
    setFilteredUserData(null);
  };

  const removeMemberFromList = (member: IUser) => {
    const filteredMembers = memberList?.filter(
      (user: any) => user.wallets.toLowerCase() !== member.wallets.toLowerCase()
    );
    handleMemberList(filteredMembers);
  };

  return (
    <Section
      margin="auto"
      width={isMobile ? '100%' : '410px'}
      flexDirection="column"
      padding={isMobile ? '0px auto' : '0px 10px'}
    >
      <ModalHeader
        title={title}
        handleClose={onClose}
        handlePrevious={handlePrevious}
      />

      <Section
        margin="50px 0 10px 0"
        flex="1"
        flexDirection="row"
        justifyContent="space-between"
      >
        <Span fontSize="18px" color={theme.textColor?.modalSubHeadingText}>
          Add Wallets
        </Span>

        <Span fontSize="14px" color={theme.textColor?.modalSubHeadingText}>
          {groupMembers
            ? `${memberList?.length + groupMembers?.length} / ${
                totalAllowedMembers
              } Members`
            : `${memberList?.length} / ${
                totalAllowedMembers
              } Members`}
        </Span>
      </Section>

      <Section flex="1">
        <ChatSearchInput
          handleSearch={handleSearch}
          clearInput={clearInput}
          placeholder="Search Web3 domain or 0x123..."
          customStyle={customSearchStyle}
        />
      </Section>

      {filteredUserData && (
        <MemberList>
          <MemberListContainer
            memberData={filteredUserData}
            handleMemberList={(member) => {
              addMemberToList(member);
              clearInput();
              setFilteredUserData('');
            }}
            darkIcon={<AddUserDarkIcon />}
          />
        </MemberList>
      )}

      <MultipleMemberList
        flexDirection="column"
        gap="5px"
        justifyContent="start"
      >
        {memberList?.map((member: any, index: any) => (
          <MemberListContainer
            key={index}
            memberList={memberList}
            memberData={member}
            handleMembers={handleMemberList}
            handleMemberList={removeMemberFromList}
            darkIcon={<MoreDarkIcon />}
          />
        ))}
      </MultipleMemberList>

      <Section flex="1" alignSelf="center">
        <ModalConfirmButton
          onClick={() => onSubmit()}
          isLoading={isLoading}
          // memberListCount={memberList?.length > 0}
          theme={theme}
        >
          {!isLoading  ? submitButtonTitle : ''}{' '}
          {isLoading && <Spinner size="30" color="#fff" />}
        </ModalConfirmButton>
      </Section>
    </Section>
  );
};

const MemberList = styled.div`
  flex: 1;
  width: 100%;
  margin-bottom: 40px;
`;

const MultipleMemberList = styled(Section)`
  height: fit-content;
  max-height: 216px;
  overflow: hidden scroll;
  padding: 0px 2px;
  width: 100%;

  &::-webkit-scrollbar-track {
    background-color: ${(props) => props.theme.scrollbarColor};
  }

  &::-webkit-scrollbar {
    background-color: ${(props) => props.theme.scrollbarColor};
    width: 6px;
  }

  @media (max-width: 768px) {
    padding: 0px 0px 0px 0px;
    max-height: 35vh;

    &::-webkit-scrollbar-track {
      background-color: none;
      border-radius: 9px;
    }

    &::-webkit-scrollbar {
      background-color: none;
      width: 4px;
    }
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-image: -webkit-gradient(
      linear,
      left top,
      left bottom,
      color-stop(0.44, #cf1c84),
      color-stop(0.72, #cf1c84),
      color-stop(0.86, #cf1c84)
    );
  }
`;

const ModalConfirmButton = styled.button<
  ModalButtonProps & { theme: IChatTheme }
>`
  margin: 60px 0 0 0;
  width: 197px;
  background: ${(props) =>
    props.theme.backgroundColor!.buttonBackground};
  color: ${(props) =>
    props.theme.textColor!.buttonText};
  border: ${(props) =>
    'none'};
  min-width: 50%;
  box-sizing: border-box;
  cursor: pointer;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
  height: 48px;
`;