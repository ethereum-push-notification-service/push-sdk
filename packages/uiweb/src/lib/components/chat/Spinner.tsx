import React, { useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import { ChatPropsContext } from '../../context';
import { ReactComponent as SpinnerSvg } from '../../icons/spinner.svg';

type SpinnerPropType = {
  size?: string;
};

type SpinLoaderPropType = {
  width?: string;
};

export const Spinner: React.FC<SpinnerPropType> = ({ size = 42 }) => {
  const { theme } = useContext<any>(ChatPropsContext);
  return (
    <SpinLoader theme={theme} width={`${size}px`}>
      <SpinnerSvg/>
    </SpinLoader>
  );
};

//styles
const spinAnimation = keyframes`
  from { transform:rotate(0deg); }
  to { transform:rotate(360deg); }
`;
const SpinLoader = styled.div<SpinLoaderPropType>`
  display: flex;
  flex: initial;
  align-self: center;
  color: ${(props) => props.theme.btnColorPrimary};
  width: ${(props) => props.width};
  animation-name: ${spinAnimation};
  animation-duration: 2500ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
`;
