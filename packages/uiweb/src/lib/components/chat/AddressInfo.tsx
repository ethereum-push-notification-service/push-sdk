import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ChatPropsContext } from '../../context';
import * as PushAPI from '@pushprotocol/restapi';
import { Constants } from '../../config';
import { copyToClipboard, pCAIP10ToWallet } from '../../helpers';
import { ReactComponent as CopySvg } from '../../icons/chat/copy.svg';

export const AddressInfo: React.FC = () => {
  const { supportAddress, env, theme } = useContext<any>(ChatPropsContext);
  const [ensName, setEnsName] = useState<string>('');
  const [user, setUser] = useState<any>({});
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const walletAddress = pCAIP10ToWallet(supportAddress);

  useEffect(() => {
    const getUser = async () => {
      const user = await PushAPI.user.get({ account: walletAddress, env });
      setUser(user);
    };
    getUser();
  }, [supportAddress]);

  return (
    <Container theme={theme}>
      <Section>
        <Image
          src={
            user?.profilePicture
              ? user?.profilePicture
              : Constants.DEFAULT_PROFILE_PICTURE
          }
          alt="address profile"
        />
        <Span theme={theme}>
          {ensName && `${ensName}`}
          {!ensName &&
            `${walletAddress.substring(0, 8)}...${walletAddress.substring(
              walletAddress.length - 8
            )}`}
        </Span>
      </Section>
      {!isCopied && (
        <CopySvg
          onClick={() => {
            copyToClipboard(walletAddress); setIsCopied(true);
          }}
          stroke={theme.btnColorSecondary}
        />
      )}
      {isCopied && (
        <CopySvg
          stroke={theme.btnColorSecondary}
          onMouseLeave={() => setIsCopied(false)}
          fill={theme.btnColorSecondary}
        />
      )}
    </Container>
  );
};

//styles
const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  box-sizing: border-box;
  background: ${(props) => props.theme.bgColorPrimary || '#fff'};
  border: ${(props) => props.theme.border};
  padding: 5px 20px 5px 5px;
  margin: 13px 0;
  border-radius: 29px;
`;

const Section = styled.div`
  display: flex;
`;

const Image = styled.img`
  display: flex;
  max-height: initial;
  vertical-align: middle;
  overflow: initial;
  height: 48px;
  width: 47.5px;
  border-radius: 99px;
`;

const Span = styled.span`
  font-weight: 500;
  font-size: 17px;
  display: flex;
  flex-wrap: wrap;
  margin: 0 10px;
  align-items: center;
  line-height: 25px;
  letter-spacing: -0.019em;
  color: ${(props: any): string => props.theme.textColorPrimary || '#000'};
`;
