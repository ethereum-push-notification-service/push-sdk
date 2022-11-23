import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ChatPropsContext } from '../../context';
import * as PushAPI from '@pushprotocol/restapi';
import Constants from './constants';
import { pCAIP10ToWallet } from '../../helpers';

export const AddressInfo: React.FC = () => {
  const { receiverAddress, env } = useContext<any>(ChatPropsContext);
  const [ensName, setEnsName] = useState<string>('');
  const [user, setUser] = useState<any>({});
  const walletAddress = pCAIP10ToWallet(receiverAddress);

  useEffect(() => {
    const getUser = async () => {
      const user = await PushAPI.user.get({ account: walletAddress, env });
      setUser(user);
    };
    getUser();
  }, [receiverAddress]);

  return (
    <Container>
      <Image src={user?.profilePicture? user?.profilePicture : Constants.DEFAULT_PROFILE_PICTURE } alt="address profile" />
      <Span>
        {ensName && `${ensName}`}
        {!ensName &&
          `${walletAddress.substring(0, 8)}...${walletAddress.substring(
            walletAddress.length - 8
          )}`}
      </Span>
    </Container>
  );
};

//styles
const Container = styled.div`
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  background: #ffffff;
  border: 1px solid #e4e8ef;
  padding: 5px;
  margin: 13px 0;
  border-radius: 29px;
`;

const Button = styled.button``;

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
  color: #1e1e1e;
`;
