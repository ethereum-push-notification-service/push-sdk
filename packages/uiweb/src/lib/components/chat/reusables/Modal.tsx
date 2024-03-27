/**
 * @file Modal
 * generic modal component for chat UI
 * does not handle any business logic, acts only as a container
 */
import { useRef, useContext } from 'react';

import styled from 'styled-components';

import { ThemeContext } from '../theme/ThemeProvider';
import { useClickAway } from '../../../hooks';
import { IChatTheme } from '../theme';
import { Section, Span, Image } from '../../reusables';
import { BackIcon } from '../../../icons/Back';
import CloseIcon from '../../../icons/close.svg';
import { MODAL_BACKGROUND_TYPE, MODAL_POSITION_TYPE, ModalBackgroundType, ModalPositionType } from '../../../types';
import { device } from '../../../config';

interface IModalProps {
  width?: string;
  clickawayClose?: () => void;
  children: any;
  theme?: IChatTheme;
  modalBackground?: ModalBackgroundType;
  modalPositionType?: ModalPositionType;
}

interface IModalHeader {
  handlePrevious?: () => void;
  handleClose?: () => void;
  title: string;
}

const ClickawayCloseModal = ({
  children,
  clickawayClose,
  width,
}: IModalProps) => {
  const modalRef = useRef(null);
  const theme = useContext(ThemeContext);

  useClickAway(modalRef, () => {
    if (clickawayClose) {
      clickawayClose();
    }
  });

  return (
    <ModalParent ref={modalRef} width={width} theme={theme}>
      {children}
    </ModalParent>
  );
};

export const Modal = ({ clickawayClose, children, width,modalBackground = MODAL_BACKGROUND_TYPE.OVERLAY,modalPositionType = MODAL_POSITION_TYPE.GLOBAL }: IModalProps) => {
  const theme = useContext(ThemeContext);
  return (
    <ModalOverlay theme={theme} modalBackground={modalBackground} modalPositionType={modalPositionType}>
      {clickawayClose ? (
        <ClickawayCloseModal clickawayClose={clickawayClose} width={width}>
          {children}
        </ClickawayCloseModal>
      ) : (
        <ModalParent width={width} theme={theme}>
          {children}
        </ModalParent>
      )}
    </ModalOverlay>
  );
};

export const ModalHeader = ({
  handlePrevious,
  handleClose,
  title,
}: IModalHeader) => {
  const theme = useContext(ThemeContext);
  return (
    <Section justifyContent="center" alignItems="center" width='100%'>
      {handlePrevious && (
        <Span onClick={() => handlePrevious()} cursor="pointer">
          <BackIcon />
        </Span>
      )}
      <Span
        fontWeight="500"
        fontSize="24px"
        color={theme.textColor?.modalHeadingText}
        flex="1"
      >
        {title}
      </Span>
      {handleClose && ( <Image
        src={CloseIcon}
        height="24px"
        maxHeight="24px"
        width={'auto'}
        onClick={() => handleClose()}
        cursor="pointer"
      />)}{' '}
    </Section>
  );
};
/* styling */

const ModalOverlay = styled.div<IModalProps>`
  position:${(props) =>  props.modalPositionType === MODAL_POSITION_TYPE.GLOBAL? 'fixed':'absolute'};
  top: 0;
  left: 0;
  right: 0;  
  bottom: 0;
  width: 100%;
  height: 100%;
  backdrop-filter:${(props) =>  props.modalBackground === MODAL_BACKGROUND_TYPE.BLUR? 'blur(3px)':'none'};
  background-color: ${(props) => props.modalBackground === MODAL_BACKGROUND_TYPE.OVERLAY? 'rgba(0, 0, 0, 0.5)':' transparent'}; /* Black with 40% opacity */
  display: flex;
  color: ${(props) => props.theme.textColor!.modalHeadingText ?? '#000'};
  justify-content: center;
  align-items: center;
  z-index: 99999999;

  max-height: 100vh;
  overflow-y: auto;
  margin: auto !important;
`;

const ModalParent = styled.div<IModalProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 20px;
  max-height: 75vh;
  // @media ${device.mobileL} {
  //   max-height: 70vh;
  // }
  background: ${(props) => props.theme.backgroundColor?.modalBackground};
  border-radius: ${(props) => props.theme.borderRadius?.modal};

  width: ${(props) => (props.width ? props.width : 'auto')};
  margin: auto !important;

  @media (max-width: 425px) {
    min-width: 300px;
    // max-width: 306px;
  }
`;
