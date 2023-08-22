import styled from "styled-components";
import { Div, Section, Span } from "../../reusables";
import { useDeviceWidthCheck } from "../../../hooks";
import { useContext } from "react";
import { ThemeContext } from "../theme/ThemeProvider";
import { NoEncryptionIcon } from "../../../icons/NoEncryption";
import { EncryptionIcon } from "../../../icons/Encryption";

const EncryptionMessageContent = {
    ENCRYPTED: {
      IconComponent: <EncryptionIcon size="15" />,
      text: 'Messages are end-to-end encrypted. Only users in this chat can view or listen to them. Click to learn more.',
    },
    NO_ENCRYPTED: {
      IconComponent: <NoEncryptionIcon size="15" />,
      text: `Messages are not encrypted`,
    },
  };
 export const EncryptionMessage = ({ id }: { id: 'ENCRYPTED' | 'NO_ENCRYPTED' }) => {
    console.log(id)
    const theme = useContext(ThemeContext);
    const isMobile = useDeviceWidthCheck(771);
    return (
      <Section
        padding="10px"
        alignSelf="center"
        borderRadius="12px"
        background={theme.bgColorPrimary}
        margin="10px 10px 0px"
        width={isMobile ? '80%' : 'fit-content'}
      >
        <EncryptionMessageDiv textAlign="center">
          {EncryptionMessageContent[id].IconComponent}
  
          <Span
            fontSize="13px"
            margin="0 0 0 5px"
            color={theme.textColorSecondary}
            fontWeight="400"
            textAlign="left"
          >
            {EncryptionMessageContent[id].text}
          </Span>
        </EncryptionMessageDiv>
      </Section>
    );
  };

  //styles
  const EncryptionMessageDiv = styled(Div)`
  text-align: center;
  svg {
    vertical-align: middle;
  }
`;