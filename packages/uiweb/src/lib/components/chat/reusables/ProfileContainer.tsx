import { useState } from 'react';
import { copyToClipboard } from '../../../helpers';
import { CopySvg2 } from '../../../icons/CopySvg2';
import { Section, Span, Image, Div, Tooltip } from '../../reusables';
import { IChatTheme } from '../theme';

type ProfileProps = {
  theme: IChatTheme;
  member: {
    wallet: string;
    image: string;
    web3Name?: string | null;
    completeWallet?: string | null;
  };
  copy?: boolean;
  customStyle?: CustomStyleParamsType | null;
};
type CustomStyleParamsType = {
  fontSize?: string;
  fontWeight?: string;
  imgHeight?: string;
  imgMaxHeight?: string;
  textColor?: string;
};
export const ProfileContainer = ({
  theme,
  member,
  copy,
  customStyle,
}: ProfileProps) => {
  const [copyText, setCopyText] = useState<string>();



  return (
    <Section justifyContent="flex-start">
      <Section
        height={customStyle?.imgHeight ?? '48px'}
        maxWidth="48px"
        borderRadius="100%"
        overflow="hidden"
        margin="0px 12px 0px 0px"
        position="relative"
      >
        <Image
          height={customStyle?.imgHeight ?? '48px'}
          maxHeight={customStyle?.imgMaxHeight ?? '48px'}
          width={'auto'}
          cursor="pointer"
          src={member?.image}
        />
      </Section>
      <Section flexDirection="column" alignItems="start" gap="5px"  whiteSpace='nowrap' >
        {!!member?.web3Name && (
          <Span
            fontSize={customStyle?.fontSize ?? '18px'}
            fontWeight={customStyle?.fontWeight ?? '400'}
            color={
              customStyle?.textColor ?? theme.textColor?.modalSubHeadingText
            }
            position="relative"
          >
            {member?.web3Name}
          </Span>
        )}
        <Tooltip content={copyText}>
          <Section
            gap="5px"
       cursor='pointer'
            onMouseEnter={() => {
              setCopyText('Copy to clipboard');
            }}
            onMouseLeave={() => {
              setCopyText('');
            }}
            onClick={() => {
              copyToClipboard(member?.completeWallet || '');
              setCopyText('copied');
            }}
          >
            <Span
              fontSize={
                member?.web3Name ? '14px' : customStyle?.fontSize ?? '18px'
              }
              fontWeight={
                member?.web3Name ? '500' : customStyle?.fontWeight ?? '400'
              }
              color={
                member?.web3Name
                  ? theme.textColor?.modalSubHeadingText
                  : customStyle?.textColor ??
                    theme.textColor?.modalSubHeadingText
              }
              position="relative"
              whiteSpace='nowrap'
            >
              {member.wallet}
            </Span>
            {!!copy && copyText && (
              <Div cursor="pointer" >
                <CopySvg2 />
              </Div>
            )}
          </Section>
        </Tooltip>
      </Section>
    </Section>
  );
};
