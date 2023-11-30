import { useContext, useState } from 'react';

import { MdCheckCircle, MdError } from 'react-icons/md';
import styled from 'styled-components';

import { ModalHeader } from '../reusables/Modal';
import OptionButtons, { OptionDescription } from '../reusables/OptionButtons';
import { Section, Span, Spinner } from '../../reusables';
import { InfoContainer, ToggleInput } from '../reusables';
import { Button } from '../reusables';
import {  ModalHeaderProps } from './CreateGroupModal';
import { GroupTypeState } from './CreateGroupModal';
import { ThemeContext } from '../theme/ThemeProvider';
import useToast from '../reusables/NewToast';
import {
  ConditionType,
  CriteriaStateType,
} from '../types/tokenGatedGroupCreationType';
import ConditionsComponent from './ConditionsComponent';
import { OperatorContainer } from './OperatorContainer';
import { SelectedCriteria } from '../../../hooks/chat/useCriteriaState';
import { useCreateGatedGroup } from '../../../hooks/chat/useCreateGatedGroup';
import { GrouInfoType as GroupInfoType } from '../types';

import { ACCESS_TYPE_TITLE } from '../constants';
import { IChatTheme } from '../exportedTypes';
import { ProfilePicture } from '../../../config';

const GROUP_TYPE_OPTIONS: Array<OptionDescription> = [
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

interface AddConditionProps {
  heading: string;
  subHeading: string;
  handleNext?: () => void;
  criteriaState: CriteriaStateType;
}

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
  groupInputDetails,
  handleNext,
  criteriaStateManager,
}: ModalHeaderProps & GroupTypeState) => {
  const [checked, setChecked] = useState<boolean>(true);
  const [groupEncryptionType, setGroupEncryptionType] = useState(
    GROUP_TYPE_OPTIONS[0].value
  );

  const { createGatedGroup, loading } = useCreateGatedGroup();
  const groupInfoToast = useToast();
  const theme = useContext(ThemeContext);

  const getEncryptionType = () => {
    if (groupEncryptionType === 'encrypted') {
      return false;
    }
    return true;
  };

  const createGroupService = async () => {
    const groupInfo: GroupInfoType = {
      groupName: groupInputDetails.groupName,
      groupDescription: groupInputDetails.groupDescription,
      groupImage: groupInputDetails.groupImage || ProfilePicture,
      isPublic: getEncryptionType(),
      groupMembers: groupInputDetails.groupMembers,
      groupAdmins: groupInputDetails.groupAdmins,
    };
    const rules: any = checked ? criteriaStateManager.generateRule() : {};
    const isSuccess = await createGatedGroup(groupInfo, rules);
    if (isSuccess === true) {
      groupInfoToast.showMessageToast({
        toastTitle: 'Success',
        toastMessage: 'Group created successfully',
        toastType: 'SUCCESS',
        getToastIcon: (size) => <MdCheckCircle size={size} color="green" />,
      });
    } else {
      showError('Group creation failed');
    }

    onClose();
  };

  const verifyAndCreateGroup = async () => {
    if (groupEncryptionType.trim() === '') {
      showError('Group encryption type is not selected');
      return;
    }

    await createGroupService();
  };

  const showError = (errorMessage: string) => {
    groupInfoToast.showMessageToast({
      toastTitle: 'Error',
      toastMessage: errorMessage,
      toastType: 'ERROR',
      getToastIcon: (size) => <MdError size={size} color="red" />,
    });
  };

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
            selectedValue={groupEncryptionType}
            handleClick={(newEl: string) => {
              setGroupEncryptionType(newEl);
            }}
          />

          <ToggleInput
            labelHeading="Gated Group"
            labelSubHeading="Turn this on for Token/NFT gating options"
            checked={checked}
            onToggle={() => setChecked(!checked)}
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
        <Button width="197px" onClick={handleNext}>
          {/* {!loading && ''} */}
          Next
          {/* {loading && <Spinner size="20" color="#fff" />} */}
        </Button>
        <InfoContainer label='Learn more about access gating rules' cta='https://push.org/docs/chat/build/conditional-rules-for-group/' />
      </Section>
    </Section>
  );
};

//styles
const ScrollSection = styled(Section)<{ theme: IChatTheme }>`
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
