import React, { useContext, useRef, useState } from 'react';

import styled from 'styled-components';

import { Section, Span } from '../../reusables';
import { MoreDarkIcon } from '../../../icons/MoreDark';
import { ThemeContext } from '../theme/ThemeProvider';
import Dropdown, { DropdownValueType } from '../reusables/DropDown';
import { ConditionArray, ConditionData, IChatTheme } from '../exportedTypes';
import { useClickAway, useTokenSymbolLoader } from '../../../hooks';
import {
  CATEGORY,
  CRITERIA_TYPE,
  CriteriaType,
  TOKEN_NFT_COMPARISION,
  TokenNftComparision,
} from '../types';

import EditSvg from '../../../icons/EditSvg.svg';
import RemoveSvg from '../../../icons/RemoveSvg.svg';
import { shortenText } from '../../../helpers';
import { GUILD_COMPARISON_OPTIONS, NETWORK_ICON_DETAILS } from '../constants';
import { CriteriaProps, MoreOptionsContainerProps } from '../../../types';

// is it being used anywhere ?
export type CriteraValueType = {
  invertedIcon?: any;
  id: number;
  type?: string;
  title?: string;
  icon?: string;
  function: () => void;
};

// fix dropdown position mobile view and z index
const MoreOptionsContainer = ({
  handleMoreOptionsClick,
  setSelectedIndex,
  selectedIndex,
  row,
  col,
  dropDownValues,
}: MoreOptionsContainerProps) => {
  const theme = useContext(ThemeContext);
  const dropdownRef = useRef<any>(null);

  useClickAway(dropdownRef, () => setSelectedIndex(null));
  return (
    <Section onClick={() => handleMoreOptionsClick(row, col)} position="static">
      <MoreDarkIcon
        color={theme.iconColor?.groupSettings}
        width="24"
        height="24"
      />
      {selectedIndex?.length && selectedIndex[0] === row && (
        <DropdownContainer ref={dropdownRef} theme={theme}>
          <Dropdown
            dropdownValues={dropDownValues}
            hoverBGColor={theme.backgroundColor?.modalHoverBackground}
          />
        </DropdownContainer>
      )}
    </Section>
  );
};

const CriteriaSection = ({ criteria }: { criteria: ConditionData }) => {
  const theme = useContext(ThemeContext);

  const getTokenNftComparisionLabel = () => {
    return TOKEN_NFT_COMPARISION[
      criteria?.data?.['comparison'] as TokenNftComparision
    ];
  };
  const checkIfNftToken = () => {
    if (
      criteria?.category === CATEGORY.ERC721 ||
      criteria?.category === CATEGORY.ERC20
    )
      return true;
    return false;
  };

  const getGuildRole = () => {
    if (!criteria?.data?.['comparison']) {
      return 'SPECIFIC';
    }
    return GUILD_COMPARISON_OPTIONS.find(
      (option) => option.value === criteria?.data?.['comparison']
    )?.heading;
  };

  const [tokenSymbol] = useTokenSymbolLoader(criteria);
  return (
    <Section gap="8px" width="100%" justifyContent='start'>
      <Span
        alignSelf="center"
        background={theme.backgroundColor?.criteriaLabelBackground}
        borderRadius="4px"
        fontSize="10px"
        color={theme.textColor?.buttonText}
        padding="4px 8px 4px 8px"
      >
        {CRITERIA_TYPE[criteria.category as CriteriaType]}
      </Span>
      {checkIfNftToken() && (
        <Section
          width="100%"
          justifyContent="space-between"
          alignItems="center"
        >
          <Span fontWeight="700" color={theme.textColor?.modalHeadingText}>
            <Span fontWeight="500" color={theme.textColor?.modalSubHeadingText}>
              {getTokenNftComparisionLabel()}{' '}
            </Span>
            {criteria?.data?.['amount']} {tokenSymbol}
          </Span>
          <ChainIconSVG padding="3px 6px 0 0" >
            {
              NETWORK_ICON_DETAILS[
                criteria?.data?.['contract'].split(
                  ':'
                )[1] as keyof typeof NETWORK_ICON_DETAILS
              ].icon
            }
          </ChainIconSVG>
        </Section>
      )}
      {criteria.category === CATEGORY.INVITE && (
        <Span fontWeight="500" color={theme.textColor?.modalSubHeadingText}>
          Owner and Admin can invite
        </Span>
      )}
      {criteria.category === CATEGORY.CustomEndpoint && (
        <Span
          fontWeight="500"
          fontSize="14px"
          color={theme.textColor?.modalSubHeadingText}
        >
          {shortenText(criteria.data?.['url'], 30)}
        </Span>
      )}
      {criteria.category === CATEGORY.ROLES && (
        <Span fontWeight="700" color={theme.textColor?.modalHeadingText}>
          {criteria?.data?.['id']}{' '}
          <Span fontWeight="500" color={theme.textColor?.modalSubHeadingText}>
            with{' '}
          </Span>
          {getGuildRole()} role
        </Span>
      )}
    </Section>
  );
};
// fix  dropdown ui
const ConditionsComponent = ({
  conditionData,
  deleteFunction,
  updateFunction,
  moreOptions = true,
}: CriteriaProps) => {
  const [selectedIndex, setSelectedIndex] = useState<Array<number> | null>(
    null
  );

  const dropdownRef = useRef<any>(null);

  const dropDownValues: DropdownValueType[] = [
    {
      id: 0,
      value: 'Edit',
      title: 'Edit',
      icon: EditSvg,
      function: () => {
        if (updateFunction) {
          if (selectedIndex) {
            updateFunction(selectedIndex[0]);
            setSelectedIndex(null);
          }
        }
      },
    },
    {
      id: 1,
      value: 'Remove',
      title: 'Remove',
      icon: RemoveSvg,
      function: () => {
        if (deleteFunction) {
          if (selectedIndex) {
            deleteFunction(selectedIndex[0]);
            setSelectedIndex(null);
          }
        }
      },
    },
  ];
  const theme = useContext(ThemeContext);

  useClickAway(dropdownRef, () => setSelectedIndex(null));

  const handleMoreOptionsClick = (row: number, col: number) => {
    setSelectedIndex([row, col]);
  };

  return (
    <Section flexDirection="column" width="100%" height="100%">
      {conditionData &&
        conditionData.slice(1).map((criteria, row) => (
          <Section flexDirection="column">
            {criteria.length <= 2 &&
              criteria.length >= 1 &&
              criteria.map((singleCriteria, col) => (
                <>
                  {singleCriteria.type && (
                    <Section
                      borderRadius={theme.borderRadius?.modalInnerComponents}
                      background={theme.backgroundColor?.modalHoverBackground}
                      padding="15px 4px 15px 12px"
                      justifyContent="space-between"
                    >
                      <CriteriaSection criteria={singleCriteria} />
                      {moreOptions && (
                        <MoreOptionsContainer
                          handleMoreOptionsClick={handleMoreOptionsClick}
                          row={row}
                          col={col}
                          dropDownValues={dropDownValues}
                          setSelectedIndex={setSelectedIndex}
                          selectedIndex={selectedIndex}
                        />
                      )}
                    </Section>
                  )}
                </>
              ))}

            {criteria[0]?.operator && criteria.length > 2 && (
              <CriteriaGroup
                theme={theme}
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                borderRadius={theme.borderRadius?.modalInnerComponents}
                padding="8px 0px 8px 8px"
                gap="25px"
              >
                <Section flexDirection="column" gap="8px" width="100%">
                  {criteria.map((singleCriteria, col) => (
                    <>
                      {singleCriteria.type && (
                        <Section
                            borderRadius={
                              theme.borderRadius?.modalInnerComponents
                            }
                            background={
                              theme.backgroundColor?.modalHoverBackground
                            }
                            padding="15px 4px 15px 12px"
                            justifyContent="space-between"
                            width="100%"
                          >
                            <CriteriaSection criteria={singleCriteria} />
                          </Section>
                      )}
                    </>
                  ))}
                </Section>
                <Section>
                  {criteria.map((singleCriteria) => (
                    <>
                      {criteria.length > 2 &&
                        singleCriteria.operator &&
                        !singleCriteria.type && (
                          <OperatorSpan theme={theme}>
                            {singleCriteria.operator}
                          </OperatorSpan>
                        )}
                    </>
                  ))}
                  {moreOptions && (
                    <MoreOptionsContainer
                      handleMoreOptionsClick={handleMoreOptionsClick}
                      row={row}
                      col={0}
                      dropDownValues={dropDownValues}
                      setSelectedIndex={setSelectedIndex}
                      selectedIndex={selectedIndex}
                    />
                  )}
                </Section>
              </CriteriaGroup>
            )}
            {conditionData &&
              row < conditionData.length - 2 &&
              conditionData[0][0]?.operator && (
                // this can be reused
                <OperatorSpan theme={theme} zIndex="-2">
                  {conditionData[0][0].operator}
                </OperatorSpan>
              )}
          </Section>
        ))}
    </Section>
  );
};

export default ConditionsComponent;

const DropdownContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  border-radius: ${(props) => props.theme.borderRadius.modalInnerComponents};

  padding: 6px 32px 6px 12px;
  z-index: 999999999999 !important;
  display: flex;
  flex-direction: column !important;
  background: ${(props) => props.theme.backgroundColor.modalBackground};
  border: ${(props) => props.theme.border.modalInnerComponents};
`;

const OperatorSpan = styled(Span)<{ theme: IChatTheme }>`
  padding: 4px 8px;
  margin: 8px 0;
  border-radius: ${(props) => props.theme.borderRadius?.modalInnerComponents};
  background: ${(props) => props.theme.backgroundColor?.modalHoverBackground};
  color: ${(props) => props.theme.textColor?.modalSubHeadingText};
`;

const CriteriaGroup = styled(Section)<{ theme: IChatTheme }>`
  border: ${(props) => props.theme.border?.modalInnerComponents};
`;

const ChainIconSVG = styled(Section)`
  width: 20px;
  height: 20px;

  svg,
  svg image,
  img {
    width: 100%;
    height: 100%;
  }
`;