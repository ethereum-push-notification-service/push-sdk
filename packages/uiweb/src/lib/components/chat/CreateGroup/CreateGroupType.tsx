import { useContext, useState } from 'react';

import styled from 'styled-components';

import { ModalHeader } from '../reusables/Modal';
import OptionButtons, { OptionDescription } from '../reusables/OptionButtons';
import { Section, Span, Spinner } from '../../reusables';
import { InfoContainer, ToggleInput } from '../reusables';
import { Button } from '../reusables';
import { ModalHeaderProps } from './CreateGroupModal';
import { GroupTypeState } from './CreateGroupModal';
import { ThemeContext } from '../theme/ThemeProvider';
import {
  ConditionType,
  CriteriaStateType,
} from '../types/tokenGatedGroupCreationType';
import ConditionsComponent from './ConditionsComponent';
import { OperatorContainer } from './OperatorContainer';
import { SelectedCriteria } from '../../../hooks/chat/useCriteriaState';

import { ACCESS_TYPE_TITLE } from '../constants';
import { IChatTheme } from '../exportedTypes';
import { AddConditionProps } from '../../../types';

export const GROUP_TYPE_OPTIONS: Array<OptionDescription> = [
  {
    heading: 'Public',
    subHeading: 'Anyone can view chats, even without joining',
    value: 'open',
  },
  {
    heading: 'Private',
    subHeading: 'Encrypted Chats, Users must join group to view',
    value: 'encrypted',
  },
];

const AddConditionSection = ({
  heading,
  subHeading,
  handleNext,
  criteriaState,
}: AddConditionProps) => {
  const theme = useContext(ThemeContext);

  const generateMapping = () => {
    return criteriaState.entryOptionsDataArray.map((rule, idx) => [
      { operator: criteriaState.entryOptionTypeArray[idx] },
      ...rule.map((el) => el),
    ]);
  };

  return (
    <Section alignItems="start" flexDirection="column" gap="0px">
      <Section flexDirection="column" alignItems="start" gap="5px" margin='0 0 5px 0'>
        <Span
          color={theme.textColor?.modalHeadingText}
          fontSize="16px"
          fontWeight="500"
        >
          {heading}
        </Span>
        <Span
          color={theme.textColor?.modalSubHeadingText}
          fontWeight="400"
          fontSize="12px"
        >
          {subHeading}
        </Span>
      </Section>

      {criteriaState.entryOptionsDataArray.length > 1 && (
        <Section margin="10px" >
          <OperatorContainer
            operator={criteriaState.entryRootCondition}
            setOperator={(newEl: string) => {
              criteriaState.setEntryRootCondition(newEl as ConditionType);
            }}
          />
        </Section>
      )}

      <ConditionsComponent
        conditionData={[
          [{ operator: criteriaState.entryRootCondition }],
          ...generateMapping(),
        ]}
        deleteFunction={(idx) => {
          criteriaState.deleteEntryOptionsDataArray(idx);
        }}
        updateFunction={(idx) => {
          criteriaState.selectEntryOptionsDataArrayForUpdate(idx);
          if (handleNext) {
            handleNext();
          }
        }}
      />

      <Button
        onClick={() => {
          if (handleNext) {
            criteriaState.setSelectedRule([]);
            criteriaState.setSelectedCriteria(-1);
            handleNext();
          }
        }}
        customStyle={{
          color: `${theme.backgroundColor?.buttonBackground}`,
          fontSize: '15px',
          fontWeight: '500',
          border: `${theme.border?.modalInnerComponents}`,
          background: 'transparent',
        }}
      >
        + Add conditions
      </Button>
    </Section>
  );
};

export const CreateGroupType = ({
  onClose,
  handlePrevious,
  handleNext,
  criteriaStateManager,
  checked = false,
  setChecked,
  handleAddWallets,
  setGroupInputDetails,
  groupInputDetails,
}: ModalHeaderProps & GroupTypeState) => {

  const theme = useContext(ThemeContext);

  return (
    <Section flexDirection="column" gap="16px">
      <ModalHeader
        title="Create Group"
        handleClose={onClose}
        handlePrevious={handlePrevious}
      />
      <ScrollSection
        width="100%"
        overflow="hidden auto"
        maxHeight="53vh"
        theme={theme}
        padding="5px 4px 5px 0"
      >
        <Section gap="20px" flexDirection="column" height="100%">
          <OptionButtons
            options={GROUP_TYPE_OPTIONS}
            selectedValue={groupInputDetails.groupEncryptionType}
            handleClick={(newEl: string) => {
              if (setGroupInputDetails) {
                setGroupInputDetails((prevState) => ({
                  ...prevState,
                  groupEncryptionType: newEl,
                }))
              }
              console.debug(newEl);
            }}
          />

          <ToggleInput
            labelHeading="Gated Group"
            labelSubHeading="Turn this on for Token/NFT gating options"
            checked={checked}
            onToggle={() => setChecked ? setChecked(!checked) : null}
          />

          {checked && (
            <Section flexDirection="column" gap="20px">
              <AddConditionSection
                criteriaState={criteriaStateManager.entryCriteria}
                handleNext={() => {
                  if (handleNext) {
                    criteriaStateManager.setSelectedCriteria(
                      SelectedCriteria.ENTRY
                    );
                    handleNext();
                  }
                }}
                {...ACCESS_TYPE_TITLE.ENTRY}
              />
              <AddConditionSection
                handleNext={() => {
                  if (handleNext) {
                    criteriaStateManager.setSelectedCriteria(
                      SelectedCriteria.CHAT
                    );
                    handleNext();
                  }
                }}
                criteriaState={criteriaStateManager.chatCriteria}
                {...ACCESS_TYPE_TITLE.CHAT}
              />
            </Section>
          )}
        </Section>
      </ScrollSection>
      <Section gap="16px" flexDirection="column">
        <Button width="197px" onClick={handleAddWallets}>
          Next
        </Button>
        <InfoContainer label='Learn more about access gating rules' cta='https://push.org/docs/chat/build/conditional-rules-for-group/' />
      </Section>
    </Section>
  );
};

//styles
const ScrollSection = styled(Section) <{ theme: IChatTheme }>`
  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.scrollbarColor};
    border-radius: 10px;
  }
  &::-webkit-scrollbar-button {
    height: 40px;
  }

  &::-webkit-scrollbar {
    width: 4px;
  }
`;