import React, { useContext } from 'react';
import { MinimizeIcon } from '../../icons/Minimize';
import styled from 'styled-components';
import {
  SupportChatMainStateContext,
  SupportChatPropsContext,
} from '../../context';
import { handleOnChatIconClick } from '../../helpers';

export const ModalHeader: React.FC = () => {
  const { modalTitle, theme } = useContext<any>(SupportChatPropsContext);
  const { isModalOpen, setIsModalOpen } = useContext<any>(
    SupportChatMainStateContext
  );

  return (
    <Container theme={theme}>
      <Span theme={theme}>{modalTitle}</Span>
      <Section
        onClick={() => handleOnChatIconClick({ isModalOpen, setIsModalOpen })}
      >
        <Div>
        <MinimizeIcon />
        </Div>
      </Section>
    </Container>
  );
};

//styles
const Container = styled.div`
  display: flex;
  border-bottom: ${(props) => props.theme.border};
  align-items: center;
  justify-content: space-between;
  padding: 17px;
`;

const Section = styled.div`
  padding: 10px 5px;
  cursor: pointer;
`;

const Div = styled.div`
  display: flex;
  max-height: initial;
  vertical-align: middle;
  overflow: initial;
  cursor: pointer;
  justify-content: flex-end;
`;

const Span = styled.span`
  font-weight: 500;
  font-size: 20px;
  line-height: 28px;
  display: flex;
  align-items: center;
  text-align: center;
  color: ${(props: any): string => props.theme.textColorPrimary || '#000'};
  margin-left: 27%;
  flex: none;
  order: 0;
  flex-grow: 0;
`;
