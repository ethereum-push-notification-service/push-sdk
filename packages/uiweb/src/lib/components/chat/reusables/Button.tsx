/**
 * @file Button
 * generic button component for chat
 * Represents the props for the Button component.
 * @interface IButtonProps
 * @property {string} [width] - The width of the button. Optional.
 * @property {React.ReactNode} children - The content of the button.
 * @property {React.MouseEventHandler} [onClick] - The click event handler for the button. Optional.
 * @property {IChatTheme} [theme] - The theme for the button. Optional.
 * @property {any} [customStyle] - Custom styles for the button. Optional.
 */

import { MouseEventHandler, useContext } from 'react';
import styled, { ThemeProvider } from 'styled-components';

import { IChatTheme } from '../theme';
import { ThemeContext } from '../theme/ThemeProvider';

export interface IButtonProps {
  width?: string;
  height?: string;
  children: any;
  onClick?: MouseEventHandler;
  customStyle?: CustomStyleParamsType;
}

type CustomStyleParamsType = {
  background?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  padding?: string;
  border?: string;
  borderRadius?: string;
  height?: string;
  maxHeight?: string;
};

/**
 * A button component.
 * @function Button
 * @param {IButtonProps} props - The props for the Button component.
 * @returns {JSX.Element} The rendered Button component.
 */
export const Button: React.FC<IButtonProps> = (props) => {
  const theme = useContext(ThemeContext);

  const { onClick, width, height, customStyle } = props;

  return (
    <ThemeProvider theme={theme}>
      <ChatButton
        onClick={onClick}
        width={width}
        height={height}
        theme={theme}
        customStyle={customStyle}
      >
        {props.children}
      </ChatButton>
    </ThemeProvider>
  );
};
/* styling */
const ChatButton = styled.button<IButtonProps>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: '2px';
  padding: ${(props) =>
    props.customStyle?.padding ? props.customStyle.padding : '16px'};
  margin-top: 12px;
  background: ${(props) =>
    props.customStyle?.background
      ? props.customStyle.background
      : props.theme.backgroundColor.buttonBackground};
  color: ${(props) =>
    props.customStyle?.color
      ? props.customStyle.color
      : props.theme.textColor.buttonText};
  border-radius: ${(props) =>
    props.customStyle?.borderRadius
      ? props.customStyle.borderRadius
      : props.theme.borderRadius.modalInnerComponents};
  border: ${(props) =>
    props.customStyle?.border
      ? props.customStyle.border
      : props.theme.border.modal};
  font-size: 16px;
  font-weight: ${(props) =>
    props.customStyle?.fontWeight ? props.customStyle.fontWeight : '500'};
  font-family: ${(props) => props.theme.fontFamily};

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;

  transition: 150ms ease-in-out;

  &:hover {
    cursor: pointer;
  }

  width: ${(props) => (props.width ? props.width : '100%')};
  height: ${(props) => (props.height ? props.height : '100%')};
`;
