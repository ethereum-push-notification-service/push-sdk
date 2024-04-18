
// React + Web3 Essentials
import { useState } from 'react';

// External Packages

// Internal Compoonents
import { copyToClipboard, pCAIP10ToWallet } from '../../../helpers';

// Internal Configs
import { Div, Image, Section, Span, Tooltip } from '../../reusables';

// Assets
import { CopyPinkIcon, ICON_COLOR } from '../../../icons/PushIcons';

// Interfaces & Types
import { IChatTheme } from '../theme';
type ProfileProps = {
  theme: IChatTheme;
  member: {
    name?: string | null;
    icon?: string | null;
    chatId?: string | null;
    abbrRecipient?: string | null;
    recipient?: string | null;
    web3Name?: string | null;
    desc?: string | null;
  };
  copy?: boolean;
  customStyle?: CustomStyleParamsType | null;
  loading?: boolean;
};

type CustomStyleParamsType = {
  fontSize?: string;
  fontWeight?: string;
  imgHeight?: string;
  imgMaxHeight?: string;
  textColor?: string;
};

// Constants

// Exported Interfaces & Types

// Exported Functions
export const ProfileContainer = ({
  theme,
  member,
  copy,
  customStyle,
  loading,
}: ProfileProps) => {
  const [copyText, setCopyText] = useState<string>();

  return (
    <Section justifyContent="flex-start">
      <Section
        height={customStyle?.imgHeight ?? '48px'}
        width={customStyle?.imgHeight ?? '48px'}
        borderRadius="100%"
        overflow="hidden"
        margin="0px 12px 0px 0px"
        position="relative"
        className={loading ? 'skeleton' : ''}
      >
        {member?.icon &&
          <Image
            height={customStyle?.imgHeight ?? '48px'}
            maxHeight={customStyle?.imgMaxHeight ?? '48px'}
            width={'auto'}
            cursor="pointer"
            src={member?.icon}
          /> 
        }
      </Section>
      <Section
        flexDirection="column"
        alignItems="start"
        whiteSpace="nowrap"
        minWidth="150px"
      >
        <>
            {member?.name || member?.web3Name || loading && (
              <Section
                justifyContent="flex-start"
                minWidth="120px"
                className={loading ? 'skeleton' : ''}
              >
                <Span
                  fontSize={customStyle?.fontSize ?? '18px'}
                  fontWeight={customStyle?.fontWeight ?? '400'}
                  color={
                    customStyle?.textColor ??
                    theme.textColor?.modalSubHeadingText
                  }
                  position="relative"
                >
                  {/* If name and web3 name then show push user name else show web3 name */}
                  {member.name && member.web3Name ? member.name : member.name ? member.name : member.web3Name}
                </Span>
              </Section>
            )}

            <Tooltip content={copyText}>
              <Section
                justifyContent="flex-start"
                gap="5px"
                cursor="pointer"
                minHeight="22px"
                minWidth="180px"
                onMouseEnter={() => setCopyText('Copy to clipboard')}
                onMouseLeave={() => setCopyText('')}
                onClick={() => {
                  copyToClipboard(
                    pCAIP10ToWallet(member?.recipient || '')
                  );
                  setCopyText('copied');
                }}
                className={loading ? 'skeleton' : ''}
              >
                <Span
                  fontSize={
                    member?.name || member?.web3Name ? '14px' : customStyle?.fontSize ?? '18px'
                  }
                  fontWeight={
                    member?.name || member?.web3Name ? '500' : customStyle?.fontWeight ?? '400'
                  }
                  color={
                    member?.name || member?.web3Name
                      ? theme.textColor?.modalSubHeadingText
                      : customStyle?.textColor ??
                        theme.textColor?.modalSubHeadingText
                  }
                  position="relative"
                  whiteSpace="nowrap"
                >
                  {member?.name && member?.web3Name ? `${member?.web3Name} | ${member.abbrRecipient}` : member.abbrRecipient}
                </Span>
                {copy && copyText && (
                  <Div cursor="pointer">
                    <CopyPinkIcon size={16} color={ICON_COLOR.PINK} />
                  </Div>
                )}
              </Section>
            </Tooltip>
          </>
      </Section>
    </Section>
  );
};
