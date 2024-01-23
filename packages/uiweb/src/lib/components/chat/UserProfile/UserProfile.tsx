import React, { useContext, useEffect, useRef, useState } from 'react';
import { IChatTheme } from '../exportedTypes';

import { Section, Span, Image } from '../../reusables';
import { ProfilePicture, device } from '../../../config';

import { ThemeContext } from '../theme/ThemeProvider';
import { useChatData } from '../../../hooks/chat/useChatData';
import styled from 'styled-components';
import useMediaQuery from '../../../hooks/useMediaQuery';
import { shortenText } from '../../../helpers';

import VerticalEllipsisIcon from '../../../icons/VerticalEllipsis.svg';
import { ProfileContainer } from '../reusables';
import { IUser } from '@pushprotocol/restapi';
import useChatProfile from '../../../hooks/chat/useChatProfile';
import { useClickAway } from '../../../hooks';

/**
 * @interface IThemeProps
 * this interface is used for defining the props for styled components
 */
interface IThemeProps {
  theme?: IChatTheme;
}

export const UserProfile = () => {
  const { env, signer, account, pushUser } = useChatData();
  const [profile, setProfile] = useState<IUser>();
  const [options, setOptions] = useState<boolean>();
  const DropdownRef = useRef(null);

  const theme = useContext(ThemeContext);
  const { fetchChatProfile } = useChatProfile();

  const isMobile = useMediaQuery(device.mobileL);

  useEffect(() => {
    (async () => {
      const user = await fetchChatProfile({});
      if (user) {
        setProfile(user);
      }
    })();
  }, [account, pushUser]);

  useClickAway(DropdownRef, () => {
    setOptions(false);
  });

  return (
    <Conatiner
      //   width="100%"
      height="inherit"
      justifyContent="space-between"
      overflow="hidden"
      padding="14px 10px "
      background="#fff"
      theme={theme}
    >
      <ProfileContainer
        theme={theme}
        member={{
          wallet: shortenText(account || '', 8, true) as string,
          image: profile?.profile?.picture || ProfilePicture,
        }}
        customStyle={{ fontSize: '17px' }}
      />
      {pushUser && (
        <Section>
          <Image
            src={VerticalEllipsisIcon}
            height="21px"
            maxHeight="21px"
            width={'auto'}
            cursor="pointer"
            onClick={() => setOptions(true)}
          />
         
        </Section>
      )}
       {options && (
            <DropDownBar theme={theme} ref={DropdownRef}>
              <DropDownItem cursor="pointer" >
                <Image
                  src={''}
                  height="21px"
                  maxHeight="21px"
                  width={'auto'}
                  cursor="pointer"
                />

                <TextItem cursor="pointer">Update Profile</TextItem>
              </DropDownItem>
            </DropDownBar>
          )}
    </Conatiner>
  );
};

//styles
const Conatiner = styled(Section)<IThemeProps>`
  border-top: 1px solid rgb(244, 245, 250);
  box-sizing: border-box;
`;

const DropDownBar = styled.div`
  position: absolute;
  bottom: 50px;
  right:20px;
  cursor: pointer;
  display: block;
  min-width: 140px;
  color: rgb(101, 119, 149);
  background: ${(props) => props.theme.backgroundColor.modalBackground};
  border: ${(props) => props.theme.border.modalInnerComponents};
  z-index: 10;
  border-radius: ${(props) => props.theme.borderRadius.modalInnerComponents};
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