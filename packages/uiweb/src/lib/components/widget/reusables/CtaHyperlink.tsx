import { Section,Span,Image } from "../../reusables";
import { Hyperlink } from "./Hyperlink";
import PushLogo from '../../../icons/pushLogo.svg';
import styled, { ThemeProvider } from "styled-components";
import { useContext } from "react";
import { ThemeContext } from "../theme/ThemeProvider";


export interface ICTAHyperlinkProps {
    title: string;
    icon: any;
    link: string;
    linkText: string;
  }
export const CTAHyperlink = ({title,icon,link,linkText}:ICTAHyperlinkProps) => {
    const theme = useContext(ThemeContext);
    return (
        <ThemeProvider theme={theme}>
      <Section gap="10px" width="100%" justifyContent="start">
        <CtaHyperlinkImage
          padding="4px"
          borderRadius="8px"
          alignItems="start"
          height="fit-content"
        >
          <Image src={icon} width="20px" height="20px" />
        </CtaHyperlinkImage>
        <Section flexDirection="column" gap="3px">
          <Span fontSize="12px" fontWeight="400" textAlign="left" color={theme?.textColor?.modalTitleText}>
            {title}
          </Span>
          <Hyperlink text={linkText} link={link} />
        </Section>
      </Section>
      </ThemeProvider>
    );
  };

  //styles
const CtaHyperlinkImage = styled(Section)`
border: 1px solid #bac4d6;
`;