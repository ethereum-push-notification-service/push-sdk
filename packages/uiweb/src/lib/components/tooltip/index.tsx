import * as React from 'react';
import styled from 'styled-components';

type TooltipProps = {
  tooltipContent: string;
};

const Tooltip: React.FC<TooltipProps> = ({ children, tooltipContent }) => {
  let timeoutId: NodeJS.Timeout;
  const [active, setActive] = React.useState(false);

  const showTip = () => {
    // show the tooltip after 400ms
    timeoutId = setTimeout(() => {
      setActive(true);
    }, 400);
  };

  const hideTip = () => {
    clearInterval(timeoutId);
    setActive(false);
  };

  return (
    <Wrapper onMouseEnter={showTip} onMouseLeave={hideTip}>
      {children} 
      {active && <Content>{tooltipContent}</Content>}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: inline-block;
  position: relative;
`;

const Content = styled.div`
  position: absolute;
  border-radius: 12px 2px 12px 12px;
  bottom: -28px;
  transform: translateX(-95%);
  padding: 0.5rem 1rem;
  color: #fff;
  background: #131313;
  font-family: 'Strawford';
  font-style: normal;
  font-weight: 400;
  font-size: 0.9rem;
  line-height: 1;
  z-index: 2;
  white-space: nowrap;
  &::before {
  bottom: 100%;
  border-bottom-color: #131313;
}
`;

export default Tooltip;
