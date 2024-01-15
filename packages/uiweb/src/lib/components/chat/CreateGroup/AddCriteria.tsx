import { useContext, useEffect, useState } from 'react';

import styled from 'styled-components';
import { MdError } from 'react-icons/md';

import {
  Button,
  DropDownInput,
  DropdownValueType,
  InfoContainer,
  ModalHeader,
  TextInput,
} from '../reusables';
import { Section, Span, Spinner } from '../../reusables';
import useMediaQuery from '../../../hooks/useMediaQuery';
import {  ModalHeaderProps } from './CreateGroupModal';
import { useChatData } from '../../../hooks';
import { QuantityInput } from '../reusables/QuantityInput';
import { ThemeContext } from '../theme/ThemeProvider';
import { Checkbox } from '../reusables/Checkbox';
import OptionButtons from '../reusables/OptionButtons';

import EthereumSvg from '../../../icons/ethereum.svg';
import PolygonSvg from '../../../icons/polygon.svg';
import ArbitrumSvg from '../../../icons/arbitrum.svg';
import BSCSvg from '../../../icons/bsc.svg';
import OptimismSvg from '../../../icons/optimisim.svg';
import { BLOCKCHAIN_NETWORK, device } from '../../../config';
import { GUILD_COMPARISON_OPTIONS, INVITE_CHECKBOX_LABEL } from '../constants';
import {
  CATEGORY,
  DropdownCategoryValuesType,
  DropdownSubCategoryValuesType,
  SUBCATEGORY,
  TYPE,
  SubCategoryKeys,
  TypeKeys,
  ReadonlyInputType,
} from '../types';
import useToast from '../reusables/NewToast';
import {
  CriteriaValidationErrorType,
  GuildData,
  PushData,
  Rule,
} from '../types/tokenGatedGroupCreationType';
import {
  checkIfCustomEndpoint,
  checkIfGuild,
  checkIfPushInvite,
  checkIfTokenNFT,
  fetchContractInfo,
  getCategoryDropdownValues,
  getCriteriaData,
  getSubCategoryDropdownValues,
  validationCriteria,
} from '../helpers';
import { IChatTheme } from '../exportedTypes';

const AddCriteria = ({ 
  handlePrevious,
  onClose,
  criteriaStateManager,
}: ModalHeaderProps) => {
  const [selectedTypeValue, setSelectedTypeValue] = useState<number>(0);
  const [validationErrors, setValidationErrors] =
    useState<CriteriaValidationErrorType>({});
  const [selectedCategoryValue, setSelectedCategoryValue] = useState<number>(0);
  const [selectedSubCategoryValue, setSelectedSubCategoryValue] =
    useState<number>(0);
  const [validationLoading, setValidationLoading] = useState<boolean>(false);
  const [guildComparison, setGuildComparison] = useState('');
  const [selectedChainValue, setSelectedChainValue] = useState<number>(0);
  const [contract, setContract] = useState<string>('');
  const [inviteCheckboxes, setInviteCheckboxes] = useState<{
    admin: boolean;
    owner: boolean;
  }>({ admin: true, owner: true });
  const [url, setUrl] = useState<string>('');
  const [guildId, setGuildId] = useState<string>('');
  const [specificRoleId, setSpecificRoleId] = useState<string>('');
  const [unit, setUnit] = useState('TOKEN');
  const [decimals, setDecimals] = useState(18);

  const [quantity, setQuantity] = useState<{ value: number; range: number }>({
    value: 0,
    range: 0,
  });
  const { env } = useChatData();
  const theme = useContext(ThemeContext);
  const groupInfoToast = useToast();

  const isMobile = useMediaQuery(device.mobileL);

  const dropdownQuantityRangeValues: Array<DropdownValueType> = [
    {
      id: 0,
      title: 'Greater than',
      value: '>',
      function: () => setQuantity({ ...quantity, range: 0 }),
    },
    {
      id: 1,
      title: 'Greater or equal to',
      value: '>=',
      function: () => setQuantity({ ...quantity, range: 1 }),
    },
    {
      id: 2,
      title: 'Less than',
      value: '<',
      function: () => setQuantity({ ...quantity, range: 2 }),
    },
    {
      id: 3,
      title: 'Less or equal to',
      value: '<=',
      function: () => setQuantity({ ...quantity, range: 3 }),
    },
    {
      id: 4,
      title: 'Equal to',
      value: '==',
      function: () => setQuantity({ ...quantity, range: 4 }),
    },
    {
      id: 5,
      title: 'Not equal to',
      value: '!=',
      function: () => setQuantity({ ...quantity, range: 5 }),
    },
  ];
  const dropdownTypeValues: Array<DropdownValueType> = [
    {
      id: 0,
      title: 'Push protocol',
      value: TYPE.PUSH,
      function: () => setSelectedTypeValue(0),
    },
    {
      id: 1,
      title: 'Guild',
      value: TYPE.GUILD,
      function: () => setSelectedTypeValue(1),
    },
  ];
  const dropdownCategoryValues: DropdownCategoryValuesType = {
    PUSH: [
      {
        id: 0,
        value: CATEGORY.ERC20,
        title: 'Token ERC20',
        function: () => setSelectedCategoryValue(0),
      },
      {
        id: 1,
        value: CATEGORY.ERC721,
        title: 'NFT ERC721',
        function: () => setSelectedCategoryValue(1),
      },
      {
        id: 2,
        value: CATEGORY.INVITE,
        title: 'Invite',
        function: () => setSelectedCategoryValue(2),
      },
      {
        id: 3,
        value: CATEGORY.CustomEndpoint,
        title: 'Custom Endpoint',
        function: () => setSelectedCategoryValue(3),
      },
    ],
    GUILD: {
      value: CATEGORY.ROLES,
      title: 'Roles',
    },
  };

  const dropdownSubCategoryValues: DropdownSubCategoryValuesType = {
    ERC20: {
      value: SUBCATEGORY.HOLDER,
      title: 'Holder',
    },
    ERC721: {
      value: SUBCATEGORY.HOLDER,
      title: 'Holder',
    },
    INVITE: {
      value: SUBCATEGORY.DEFAULT,
      title: 'Default',
    },
    CustomEndpoint: [
      {
        id: 0,
        value: SUBCATEGORY.GET,
        title: 'Get',
        function: () => setSelectedSubCategoryValue(0),
      },
    ],
    ROLES: {
      value: SUBCATEGORY.DEFAULT,
      title: 'Default',
    },
  };

  const dropdownChainsValues: Array<DropdownValueType> = [
    {
      id: 0,
      value: BLOCKCHAIN_NETWORK[env as keyof typeof BLOCKCHAIN_NETWORK].ETHEREUM,
      title: 'Ethereum',
      icon: EthereumSvg,
      function: () => setSelectedChainValue(0),
    },
    {
      id: 1,
      value: BLOCKCHAIN_NETWORK[env as keyof typeof BLOCKCHAIN_NETWORK].POLYGON,
      title: 'Polygon',
      icon: PolygonSvg,
      function: () => setSelectedChainValue(1),
    },
    {
      id: 2,
      value: BLOCKCHAIN_NETWORK[env as keyof typeof BLOCKCHAIN_NETWORK].BSC,
      title: 'BSC',
      icon: BSCSvg,
      function: () => setSelectedChainValue(2),
    },
    {
      id: 3,
      value: BLOCKCHAIN_NETWORK[env as keyof typeof BLOCKCHAIN_NETWORK].OPTIMISM,
      title: 'Optimism',
      icon: OptimismSvg,
      function: () => setSelectedChainValue(3),
    },
    {
      id: 4,
      value: BLOCKCHAIN_NETWORK[env as keyof typeof BLOCKCHAIN_NETWORK].ARBITRUM,
      title: 'Arbitrum',
      icon: ArbitrumSvg,
      function: () => setSelectedChainValue(4),
    },
  ];

  const onQuantityChange = (e: any) => {
    setQuantity({ ...quantity, value: e.target.value });
  };

  const verifyAndDoNext = async () => {
    setValidationLoading(true);
    const _type = dropdownTypeValues[selectedTypeValue].value as
      | 'PUSH'
      | 'GUILD';
    const category: string =
      _type === 'PUSH'
        ? (dropdownCategoryValues[_type] as DropdownValueType[])[
            selectedCategoryValue
          ].value || CATEGORY.ERC20
        : 'ROLES';

    let subCategory = 'DEFAULT';
    if (_type === 'PUSH') {
      if (category === CATEGORY.ERC20 || category === CATEGORY.ERC721) {
        subCategory = SUBCATEGORY.HOLDER;
      } else if (category === CATEGORY.CustomEndpoint) {
        subCategory = 'GET';
      }
    }

    const rule: Rule = {
      type: _type,
      category: category,
      subcategory: subCategory,
      data: getCriteriaData({
        type: _type,
        category,
        contract,
        quantity,
        decimals,
        unit,
        url,
        inviteCheckboxes,
        guildComparison,
        specificRoleId,
        guildId,
        dropdownQuantityRangeValues,
        selectedChainValue,
        dropdownChainsValues,
      }),
    };

    //guild validation added
    const errors = await validationCriteria(rule);
    setValidationLoading(false);
    if (Object.keys(errors).length) {
      setValidationErrors(errors);
    } else {
      const isSuccess = criteriaState.addNewRule(rule);
      if (!isSuccess) {
        showError('Selected Criteria was already added');
        return;
      }
      if (handlePrevious) {
        handlePrevious();
      }
    }
  };

  const criteriaState = criteriaStateManager.getSelectedCriteria();

  // Autofill the form for the update
  useEffect(() => {
    if (criteriaState.isUpdateCriteriaEnabled()) {
      //Load the states
      const oldValue =
        criteriaState.selectedRules[criteriaState.updateCriteriaIdx];

      if (oldValue.type === 'PUSH') {
        // category
        setSelectedCategoryValue(
          (dropdownCategoryValues.PUSH as DropdownValueType[]).findIndex(
            (obj) => obj.value === oldValue.category
          )
        );

        const pushData = oldValue.data as PushData;

        // sub category
        if (
          oldValue.category === CATEGORY.ERC20 ||
          oldValue.category === CATEGORY.ERC721
        ) {
          if (pushData.token) {
            setUnit(pushData.token);
          }

          if (pushData.decimals) {
            setDecimals(decimals);
          }

          // TODO: make helper function for this
          const contractAndChain: string[] = (
            pushData.contract || 'eip155:1:0x'
          ).split(':');
          setSelectedChainValue(
            dropdownChainsValues.findIndex(
              (obj) =>
                obj.value === contractAndChain[0] + ':' + contractAndChain[1]
            )
          );
          setContract(contractAndChain.length === 3 ? contractAndChain[2] : '');
          setQuantity({
            value: pushData.amount || 0,
            range: dropdownQuantityRangeValues.findIndex(
              (obj) => obj.value === pushData.comparison
            ),
          });
        } else if (oldValue.category === CATEGORY.INVITE) {
          setInviteCheckboxes({
            admin: true,
            owner: true,
          });
        } else {
          // invite
          setUrl(pushData.url || '');
        }
      } else {
        // guild condition
        setGuildId((oldValue.data as GuildData).id);
        setSpecificRoleId((oldValue.data as GuildData).role);
        setGuildComparison(
          (oldValue.data as GuildData).comparison ||
            GUILD_COMPARISON_OPTIONS[2].value
        );
      }

      setSelectedTypeValue(
        dropdownTypeValues.findIndex((obj) => obj.value === oldValue.type)
      );
    }
  }, []);

  useEffect(() => {
    // Debouncing
    // Fetch the contract info
    const getData = setTimeout(async () => {
      await fetchContractInfo({
        setValidationErrors,
        selectedCategoryValue,
        selectedTypeValue,
        dropdownCategoryValues,
        dropdownTypeValues,
        contract,
        setUnit,
        setDecimals,
        selectedChainValue,
        dropdownChainsValues,
      });
    }, 2000);
    return () => clearTimeout(getData);
  }, [contract, selectedCategoryValue, selectedChainValue]);

  const showError = (errorMessage: string) => {
    groupInfoToast.showMessageToast({
      toastTitle: 'Error',
      toastMessage: errorMessage,
      toastType: 'ERROR',
      getToastIcon: (size) => <MdError size={size} color="red" />,
    });
  };

  return (
    <ScrollSection
      theme={theme}
      flexDirection="column"
      gap="12px"
      overflow="hidden scroll"
      justifyContent="start"
      padding='0 2px 0 10px'
      width={isMobile ? '300px' : '400px'}
    >
      <Section margin="0 0 5px 0">
        <ModalHeader
          handleClose={onClose}
          handlePrevious={handlePrevious}
          title={
            criteriaState.isUpdateCriteriaEnabled()
              ? 'Update Criteria'
              : 'Add Criteria'
          }
        />
      </Section>
      <DropDownInput
        labelName="Type"
        selectedValue={selectedTypeValue}
        dropdownValues={dropdownTypeValues}
      />
      <Section
        zIndex="unset"
        justifyContent="space-between"
        alignItems="center"
      >
        <Section width="48%" zIndex='unset'>
          {Array.isArray(
            getCategoryDropdownValues({
              dropdownCategoryValues,
              dropdownTypeValues,
              selectedTypeValue,
            })
          ) ? (
            <DropDownInput
              labelName="Gating Category"
              selectedValue={selectedCategoryValue}
              dropdownValues={
                getCategoryDropdownValues({
                  dropdownCategoryValues,
                  dropdownTypeValues,
                  selectedCategoryValue,

                  selectedTypeValue,
                }) as DropdownValueType[]
              }
            />
          ) : (
            <TextInput
              labelName="Gating category"
              inputValue={
                (
                  getCategoryDropdownValues({
                    dropdownCategoryValues,
                    dropdownTypeValues,
                    selectedCategoryValue,
                    selectedTypeValue,
                  }) as ReadonlyInputType
                )?.title
              }
              disabled={true}
              customStyle={{
                background: theme.backgroundColor?.modalHoverBackground,
              }}
            />
          )}
        </Section>
        <Section width="48%">
          {Array.isArray(
            getSubCategoryDropdownValues({
              dropdownCategoryValues,
              dropdownTypeValues,
              selectedCategoryValue,
              dropdownSubCategoryValues,
              selectedTypeValue,
            })
          ) ? (
            <DropDownInput
              labelName="Sub-Category"
              selectedValue={selectedSubCategoryValue}
              dropdownValues={
                getSubCategoryDropdownValues({
                  dropdownCategoryValues,
                  dropdownTypeValues,
                  selectedCategoryValue,
                  dropdownSubCategoryValues,
                  selectedTypeValue,
                }) as DropdownValueType[]
              }
            />
          ) : (
            <TextInput
              labelName="Sub-category"
              inputValue={
                (
                  getSubCategoryDropdownValues({
                    dropdownCategoryValues,
                    dropdownTypeValues,
                    selectedCategoryValue,
                    dropdownSubCategoryValues,
                    selectedTypeValue,
                  }) as ReadonlyInputType
                )?.title
              }
              disabled={true}
              customStyle={{
                background: theme.backgroundColor?.modalHoverBackground,
              }}
            />
          )}
        </Section>
      </Section>
      {/* shift to minor components  leave for now*/}
      {checkIfTokenNFT({
        dropdownCategoryValues,
        dropdownTypeValues,
        selectedCategoryValue,
        selectedTypeValue,
      }) && (
        <>
          <DropDownInput
            labelName="Blockchain"
            selectedValue={selectedChainValue}
            dropdownValues={dropdownChainsValues}
          />
          <Section gap="10px" flexDirection="column" alignItems="start">
            <TextInput
              labelName="Contract"
              inputValue={contract}
              onInputChange={(e: any) => setContract(e.target.value)}
              placeholder="e.g. 0x123..."
              error={!!validationErrors?.tokenError}
            />
            {!!validationErrors?.tokenError && (
              <ErrorSpan>{validationErrors?.tokenError}</ErrorSpan>
            )}
          </Section>
          <Section gap="10px" flexDirection="column" alignItems="start">
            <QuantityInput
              dropDownValues={dropdownQuantityRangeValues}
              labelName="Quantity"
              inputValue={quantity}
              error={!!validationErrors?.tokenAmount}
              onInputChange={onQuantityChange}
              placeholder="e.g. 1.45678"
              unit={unit}
            />
            {!!validationErrors?.tokenAmount && (
              <ErrorSpan>{validationErrors?.tokenAmount}</ErrorSpan>
            )}
          </Section>
        </>
      )}

      {checkIfCustomEndpoint({
        dropdownCategoryValues,
        dropdownTypeValues,
        selectedCategoryValue,
        selectedTypeValue,
      }) && (
        <Section gap="10px" flexDirection="column" alignItems="start">
          <TextInput
            labelName="URL"
            inputValue={url}
            onInputChange={(e: any) => setUrl(e.target.value)}
            placeholder="e.g. abc.com"
            error={!!validationErrors?.url}
          />
          {!!validationErrors?.url && (
            <ErrorSpan>{validationErrors?.url}</ErrorSpan>
          )}
        </Section>
      )}
      {checkIfPushInvite({
        dropdownCategoryValues,
        dropdownTypeValues,
        selectedCategoryValue,
        selectedTypeValue,
      }) && (
        <Section flexDirection="column" gap="10px">
          {Object.keys(INVITE_CHECKBOX_LABEL).map((key) => (
            <Checkbox
              labelName={
                INVITE_CHECKBOX_LABEL[key as keyof typeof INVITE_CHECKBOX_LABEL]
              }
              onToggle={() =>
                setInviteCheckboxes({
                  admin: true,
                  owner: true,
                })
              }
              checked={
                inviteCheckboxes[key as keyof typeof INVITE_CHECKBOX_LABEL]
              }
            />
          ))}
        </Section>
      )}

      {checkIfGuild(dropdownTypeValues, selectedTypeValue) && (
        <>
          <Section gap="10px" flexDirection="column" alignItems="start">
            <TextInput
              labelName="ID"
              inputValue={guildId}
              onInputChange={(e: any) => setGuildId(e.target.value)}
              placeholder="e.g. 4687"
              error={!!validationErrors?.guildId}
            />
            {!!validationErrors?.guildId && (
              <ErrorSpan>{validationErrors?.guildId}</ErrorSpan>
            )}
          </Section>
          <Section gap="10px" flexDirection="column" alignItems="start">
            <OptionButtons
              options={GUILD_COMPARISON_OPTIONS}
              totalWidth={isMobile?'400px':'410px'}
              selectedValue={guildComparison}
              error={!!validationErrors?.guildComparison}
              handleClick={(newEl: string) => {
                setGuildComparison(newEl);
              }}
            />
            {!!validationErrors?.guildComparison && (
              <ErrorSpan>{validationErrors?.guildComparison}</ErrorSpan>
            )}
          </Section>
          {guildComparison === 'specific' && (
            <Section gap="10px" flexDirection="column" alignItems="start">
              <TextInput
                labelName="Specific Role"
                inputValue={specificRoleId}
                onInputChange={(e: any) => setSpecificRoleId(e.target.value)}
                placeholder="e.g. 4687"
                error={!!validationErrors?.guildRole}
              />
              {!!validationErrors?.guildRole && (
                <ErrorSpan>{validationErrors?.guildRole}</ErrorSpan>
              )}
            </Section>
          )}
        </>
      )}
      <Button width="197px" onClick={verifyAndDoNext}>
        {!validationLoading &&
          (criteriaState.isUpdateCriteriaEnabled() ? 'Update' : 'Add')}
        {validationLoading && <Spinner size="20" color="#fff" />}
      </Button>
      <InfoContainer label={'Learn more about access gating rules'} cta='https://push.org/docs/chat/build/conditional-rules-for-group/' />
    </ScrollSection>
  );
};

export default AddCriteria;

const ErrorSpan = styled(Span)`
  font-size: 12px;
  font-weight: 500;
  color: #ed5858;
`;

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
