// React + Web3 Essentials
import React, { useContext, useState } from 'react';

// External Packages
import styled from 'styled-components';

// Internal Components
import { MoreLightIcon } from '../../../icons/MoreLight';
import { shortenText } from '../../../helpers';
import { ThemeContext } from '../theme/ThemeProvider';
import { useChatData } from '../../../hooks';
import { Section, Span } from '../../reusables';
import Dropdown from '../reusables/DropDown';
import { pCAIP10ToWallet } from '../../../helpers';
import { device } from '../../../config';
import { ProfileContainer } from '../reusables';
import { isAdmin } from '../helpers';
import { MemberProfileCardProps } from '../../../types';

export const MemberProfileCard = ({
  key,
  member,
  dropdownValues,
  selectedMemberAddress,
  setSelectedMemberAddress,
  dropdownRef,
}: MemberProfileCardProps) => {
  const theme = useContext(ThemeContext);
  const { account } = useChatData();

  const [dropdownHeight, setDropdownHeight] = useState<number | undefined>(0);

  const handleHeight = (id: any) => {
    const containerHeight = document
      .getElementById(id)
      ?.getBoundingClientRect();
    setDropdownHeight(containerHeight?.top);
  };

  return (
    <ProfileCardItem
      background={
        (member.address?.toLowerCase() === selectedMemberAddress?.toLowerCase()) ? 
        theme.backgroundColor?.modalHoverBackground
         : ''
      }
      id={member?.address}
      key={key}
      theme={theme}
    >
      <ProfileContainer
        theme={theme}
        member={{
          wallet: shortenText(pCAIP10ToWallet(member?.address), 6, true),
          image: member?.userInfo?.profile?.picture,
        }}
      />
      <Section justifyContent="flex-end" position="relative" zIndex="2">
        {isAdmin(member)&& (
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
        {pCAIP10ToWallet(member?.address)!.toLowerCase() !==
          pCAIP10ToWallet(account!.toLowerCase()!) &&
          dropdownValues.length > 0 && (
            <Section
              maxWidth="fit-content"
              padding="0 0px 0 0"
              position="relative"
              zIndex="2"
              onClick={() => {
                handleHeight(member.address);
                setSelectedMemberAddress(member?.address);
              }}
              style={{ cursor: 'pointer' }}
            >
              <MoreLightIcon fill={theme.iconColor?.groupSettings} />
            </Section>
       )} 
      </Section>
      {selectedMemberAddress?.toLowerCase() ==
        member?.address?.toLowerCase() && (
        <DropdownContainer
          style={{ top: dropdownHeight! > 570 ? '30%' : '40%' }}
          theme={theme}
          ref={dropdownRef}
        >
          <Dropdown
            dropdownValues={dropdownValues}
            hoverBGColor={theme.backgroundColor?.modalHoverBackground}
          />
        </DropdownContainer>
      )}
    </ProfileCardItem>
  );
};

//styles
const ProfileCardItem = styled(Section)<{ id: any; key: any; background: any }>`
  justify-content: space-between;
  padding: 8px 8px;
  border-bottom: ${(props) => props.theme.border.modalInnerComponents};
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

const DropdownContainer = styled(Section)`
  position: absolute;
  left: 48%;
  top: 69%;
  border-radius: ${(props) => props.theme.borderRadius.modalInnerComponents};
  padding: 14px 8px;
  z-index: 999999999999 !important;
  display: flex;
  flex-direction: column !important;
  background: ${(props) => props.theme.backgroundColor.modalBackground};
  border: ${(props) => props.theme.border.modal};

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