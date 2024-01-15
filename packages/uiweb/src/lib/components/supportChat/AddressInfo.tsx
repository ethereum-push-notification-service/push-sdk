import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { SupportChatPropsContext } from '../../context';
import { Constants } from '../../config';
import { copyToClipboard, pCAIP10ToWallet } from '../../helpers';
import { CopySvg } from '../../icons/CopySvg';

export const AddressInfo: React.FC = () => {
  const { supportAddress, env, theme, pushUser } = useContext<any>(SupportChatPropsContext);
  const [ensName, setEnsName] = useState<string>('');
  const [user, setUser] = useState<any>({});
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const walletAddress = pCAIP10ToWallet(supportAddress);

  useEffect(() => {
    const getUser = async () => {
      if (Object.keys(pushUser || {}).length) {
  const user = await pushUser.info();
      setUser(user);
}
      
    };
    getUser();
  }, [supportAddress, pushUser]);

  return (
    <Container theme={theme}>
      <Section>
        <ImgSpan>
          <Image
            src={
              user?.profile?.picture
                ? user?.profile.picture
                : Constants.DEFAULT_PROFILE_PICTURE
            }
            alt="address profile"
          />
        </ImgSpan>
        <Span theme={theme}>
          {ensName && `${ensName}`}
          {!ensName &&
            `${walletAddress.substring(0, 8)}...${walletAddress.substring(
              walletAddress.length - 8
            )}`}
        </Span>
      </Section>
      {!isCopied && (
        <div
          onClick={() => {
            copyToClipboard(walletAddress);
            setIsCopied(true);
          }}
        >
          <CopySvg stroke={theme.btnColorSecondary} />
        </div>
      )}
      {isCopied && (
        <div onMouseLeave={() => setIsCopied(false)}>
          <CopySvg
            stroke={theme.btnColorSecondary}
            fill={theme.btnColorSecondary}
          />
        </div>
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
const ImgSpan = styled.span`
  display: flex;
  max-height: initial;
  vertical-align: middle;
  overflow: hidden;
  height: 48px;
  width: 47.5px;
  border-radius: 99px;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
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
