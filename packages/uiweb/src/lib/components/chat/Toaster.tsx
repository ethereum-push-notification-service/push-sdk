import React, { useContext, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { ChatMainStateContext, ChatPropsContext } from '../../context';
import { ReactComponent as ErrorSvg } from '../../icons/error.svg';
import { ReactComponent as CloseSvg } from '../../icons/close.svg';

type ToasterPropType = {
  message: string;
  type: 'error' | 'success';
};

type ContainerPropType = {
  type: 'error' | 'success';
};

export const Toaster: React.FC<ToasterPropType> = ({ message, type }) => {
  const { theme } = useContext<any>(ChatPropsContext);
  const { setToastMessage } = useContext<any>(ChatMainStateContext);

  useEffect(() => {
    const interval = setInterval(() => {
     onClose();
    }, 5000);
  
    return () => clearInterval(interval); 
  }, [])
  
  const onClose = () => {
    setToastMessage('');
  };


  return (
    <Container theme={theme} type={type}>
      {type === 'error' && <ErrorSvg width = '26px'/>}
      <Span>{message}</Span>
      <CloseSvg width = '18.6px' onClick={() => onClose()} />
    </Container>
  );
};

//styles

const Container = styled.div<ContainerPropType>`
  display: flex;
  box-sizing: border-box;
  justify-content: space-between;
  ${(props) =>
    props.type === 'error' &&
    css`
      background: linear-gradient(
        90.15deg,
        #ff2070 -125.65%,
        #ff2d79 -125.63%,
        #fff9fb 42.81%
      );
    `}

  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  padding: 13px;
  margin-bottom:6px;
`;

const Span = styled.span`
  font-family: 'Strawford';
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  line-height: 140%;
  display: flex;
  align-items: center;
  color: #657795;
  padding: 0 20px 0 0 ;
`;

