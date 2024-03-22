import { useContext, useRef, useState } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../theme/ThemeProvider';
import { useClickAway } from '../../../hooks';
import Dropdown, { DropdownValueType } from '../reusables/DropDown';
import { Section, Span } from '../../reusables/sharedStyling';
import DismissAdmin from '../../../icons/dismissadmin.svg';
import AddAdmin from '../../../icons/addadmin.svg';
import Remove from '../../../icons/remove.svg';
import { findObject } from '../helpers/helper';
import { device } from '../../../config';
import { shortenText } from '../../../helpers';
import { ProfileContainer } from '../reusables';
import { MemberListContainerType, WalletProfileContainerProps } from '../../../types';

export const MemberListContainer = ({
  key,
  memberData,
  handleMembers,
  handleMemberList,
  darkIcon,
  memberList,
}: MemberListContainerType) => {
  const theme = useContext(ThemeContext);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [dropdownHeight, setDropdownHeight] = useState<number | undefined>(0);
  const dropdownRef = useRef<any>(null);

  useClickAway(dropdownRef, () => setSelectedWallet(null));

  const removeAdminDropdown: DropdownValueType = {
    id: 'dismiss_admin',
    title: 'Dismiss as admin',
    icon: DismissAdmin,
    function: () => dismissGroupAdmin(),
  };

  const addAdminDropdown: DropdownValueType = {
    id: 'dismiss_admin',
    title: 'Make group admin',
    icon: AddAdmin,
    function: () => makeGroupAdmin(),
  };

  const removeUserDropdown: DropdownValueType = {
    id: 'remove_user',
    title: 'Remove',
    icon: Remove,
    function: () => removeUser(),
  };

  const dismissGroupAdmin = () => {
    const updatedMembers = memberList.map((member: any) =>
      member?.wallets?.toLowerCase() == memberData?.wallets?.toLowerCase()
        ? { ...member, isAdmin: false }
        : member
    );
    handleMembers?.(updatedMembers);
    setSelectedWallet(null);
  };

  const makeGroupAdmin = () => {
    const updatedMembers = memberList.map((member: any) =>
      member?.wallets?.toLowerCase() == memberData?.wallets?.toLowerCase()
        ? { ...member, isAdmin: true }
        : member
    );
    handleMembers?.(updatedMembers);
    setSelectedWallet(null);
  };

  const removeUser = () => {
    handleMemberList(memberData);
    setSelectedWallet(null);
  };

  const handleHeight = (id: any) => {
    const containerHeight = document
      .getElementById(id)
      ?.getBoundingClientRect();
    setDropdownHeight(containerHeight?.top);
  };
  return (
    <WalletProfileContainer
      id={memberData?.wallets}
      background={
        memberList ? 'transparent' : theme.backgroundColor?.modalHoverBackground
      }
      border={
        memberList ? theme.border?.modalInnerComponents:'none' 
      }
      borderRadius={theme.borderRadius?.modalInnerComponents}
    >
      <ProfileContainer
        theme={theme}
        member={{
          wallet: shortenText(memberData.wallets?.split(':')[1], 6, true),
          image: memberData.profilePicture || '',
        }}
      />

      <Section justifyContent="flex-end">
        {memberData?.isAdmin && (
          <Span
            background="#F4DCEA"
            color="#D53A94"
            borderRadius="8px"
            padding="6px"
            fontWeight="500"
            fontSize="10px"
          >
            Admin
          </Span>
        )}
        <Section
          maxWidth="fit-content"
          onClick={() => {
            handleHeight(memberData?.wallets);
            setSelectedWallet(null);
            memberList
              ? findObject(memberData, memberList, 'wallets')
                ? setSelectedWallet(memberData?.wallets)
                : handleMemberList(memberData)
              : handleMemberList(memberData);
          }}
        >
          {darkIcon}
        </Section>
      </Section>

      {selectedWallet?.toLowerCase() == memberData?.wallets?.toLowerCase() && (
        <DropdownContainer
          style={{ top: dropdownHeight! > 500 ? '30%' : '45%' }}
          ref={dropdownRef}
          theme={theme}
        >
          <Dropdown
            dropdownValues={
              memberData?.isAdmin
                ? [removeAdminDropdown, removeUserDropdown]
                : [addAdminDropdown, removeUserDropdown]
            }
            hoverBGColor={theme.backgroundColor?.modalHoverBackground}
          />
        </DropdownContainer>
      )}
    </WalletProfileContainer>
  );
};

const WalletProfileContainer = styled(Section)<WalletProfileContainerProps>`
  justify-content: space-between;
  padding: 8px 16px;
    border: ${(props) => props.border};
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-height: 64px;
  align-self: stretch;
  display: flex;
  height: auto;
  z-index: auto;
  flex: 1;
  @media (max-width: 480px) {
    max-width: 100%;
  }
`;

const DropdownContainer = styled.div`
  position: absolute;
  left: 48%;
  top: 69%;
  border-radius: ${(props) => props.theme.borderRadius.modalInnerComponents};
  padding: 14px 8px;
  z-index: 999999999999 !important;
  display: flex;
  flex-direction: column !important;
  background: ${(props) => props.theme.backgroundColor.modalBackground};
  border: ${(props) => props.theme.border.modalInnerComponents};

  @media ${device.mobileL} {
    left: 27%;
  }
  @media (min-width: 426px) and (max-width: 1150px) {
    left: 48%;
  }
  @media (max-width: 480px) {
    left: 25%;
  }
`;