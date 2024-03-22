import { useEffect, useRef, useState } from 'react';

import styled from 'styled-components';
import {
  ChatMemberProfile,
  GroupParticipantCounts,
  IUser,
  ParticipantStatus,
} from '@pushprotocol/restapi';
import { MdCheckCircle, MdError } from 'react-icons/md';

import { useChatData, usePushChatStream } from '../../../hooks';
import { Section, Span, Image } from '../../reusables/sharedStyling';
import { AddWalletContent } from './AddWalletContent';
import { Modal, ModalHeader } from '../reusables';
import useMediaQuery from '../../../hooks/useMediaQuery';
import useToast from '../reusables/NewToast';
import useUpdateGroup from '../../../hooks/chat/useUpdateGroup';
import ConditionsComponent from '../CreateGroup/ConditionsComponent';
import { AcceptedMembers, PendingMembers } from './PendingMembers';
import { Spinner } from '../../reusables';

import { IChatTheme } from '../theme';
import { device } from '../../../config';
import LockIcon from '../../../icons/Lock.png';
import LockSlashIcon from '../../../icons/LockSlash.png';
import addIcon from '../../../icons/addicon.svg';
import { copyToClipboard, shortenText } from '../../../helpers';
import {
  ACCEPTED_MEMBERS_LIMIT,
  ACCESS_TYPE_TITLE,
  OPERATOR_OPTIONS_INFO,
  PENDING_MEMBERS_LIMIT,
} from '../constants';
import { getRuleInfo } from '../helpers/getRulesToCondtionArray';
import {
  Group,

} from '../exportedTypes';
import { MODAL_BACKGROUND_TYPE, MODAL_POSITION_TYPE,ModalBackgroundType,ModalPositionType } from '../../../types';

import { TokenGatedSvg } from '../../../icons/TokenGatedSvg';
import { GROUP_ROLES } from '../types';
import useGroupMemberUtilities from '../../../hooks/chat/useGroupMemberUtilities';
import useChatProfile from '../../../hooks/chat/useChatProfile';
import { resolvePromisesSeq, transformIUserToChatMemberProfile } from '../helpers';
import useUserProfile from '../../../hooks/useUserProfile';
import { MemberPaginationData, MembersType, ConditionsInformationProps } from '../../../types';

export const ConditionsInformation = ({
  theme,
  groupInfo,
  alert,
  header,
  subheader,
}: ConditionsInformationProps) => {
  const groupRules = getRuleInfo(groupInfo?.rules);
  const isMobile = useMediaQuery(device.mobileL);

  const getOperator = (key: keyof typeof groupRules) => {
    if (groupRules[key as keyof typeof groupRules].length) {
      return groupRules[key as keyof typeof groupRules][0][0]
        ?.operator as keyof typeof OPERATOR_OPTIONS_INFO;
    }
    return null;
  };

  return (
    <Section
      margin="5px 0px 0px 0px"
      gap="16px"
      flexDirection="column"
      width="100%"
    >
      {!!Object.keys(groupInfo?.rules || {}).length && (
        <GroupTypeBadge
          theme={theme}
          icon={<TokenGatedSvg color={alert ? '#E93636' : undefined} />}
          header={header ?? 'Gated group'}
          subheader={subheader ?? 'Conditions must be true to join and chat'}
          alert={alert}
        />
      )}
      <ConditionSection
        overflow="hidden auto"
        maxHeight={isMobile ? '46vh' : '49vh'}
        justifyContent="start"
        flexDirection="column"
        padding="0 2px 0 0"
        theme={theme}
      >
        {Object.keys(ACCESS_TYPE_TITLE).map((key, idx) => (
          <>
            {getOperator(key as keyof typeof groupRules) ? (
              <Section key={idx} flexDirection="column">
                <Span
                  fontSize="16px"
                  fontWeight="500"
                  alignSelf="start"
                  margin="5px 0"
                >
                  {
                    ACCESS_TYPE_TITLE[key as keyof typeof ACCESS_TYPE_TITLE]
                      ?.heading
                  }
                </Span>

                <Span fontSize="14px" margin="15px 0">
                  {
                    OPERATOR_OPTIONS_INFO[
                      groupRules[key as keyof typeof groupRules][0][0]
                        ?.operator as keyof typeof OPERATOR_OPTIONS_INFO
                    ]?.head
                  }
                  <Span color={theme.textColor?.modalSubHeadingText}>
                    {' '}
                    {
                      OPERATOR_OPTIONS_INFO[
                        groupRules[key as keyof typeof groupRules][0][0]
                          ?.operator as keyof typeof OPERATOR_OPTIONS_INFO
                      ]?.tail
                    }
                  </Span>
                </Span>
                <Section
                  width="100%"
                  justifyContent="start"
                  flexDirection="column"
                >
                  <ConditionsComponent
                    moreOptions={false}
                    conditionData={groupRules[key as keyof typeof groupRules]}
                  />
                </Section>
              </Section>
            ) : null}
          </>
        ))}
      </ConditionSection>
    </Section>
  );
};

interface GroupTypeProps {
  theme: IChatTheme;
  icon: React.ReactNode;
  header: string;
  subheader: string;
  cursor?: string;
  handleNextInformation?: () => void;
  alert?: boolean;
}

export const GroupTypeBadge = ({
  theme,
  icon,
  header,
  subheader,
  handleNextInformation,
  cursor,
  alert,
}: GroupTypeProps) => {
  return (
    // <Section cursor={cursor} justifyContent='start' alignItems='start'>
    <PublicEncrypted
      onClick={handleNextInformation}
      theme={theme}
      alert={alert}
      cursor="pointer"
      justifyContent="start"
    >
      {/* <Image
          cursor={cursor}
          src={icon}
          height="24px"
          maxHeight="24px"
          width={'auto'}
        /> */}
      {icon}
      <Section
        cursor={cursor}
        flexDirection="column"
        alignItems="flex-start"
        gap="5px"
      >
        <Span
          cursor={cursor}
          fontSize="18px"
          textAlign="left"
          color={theme.textColor?.modalHeadingText}
        >
          {header}
        </Span>
        <Span
          cursor={cursor}
          textAlign="left"
          fontSize="12px"
          color={theme.textColor?.modalSubHeadingText}
        >
          {subheader}
        </Span>
      </Section>
    </PublicEncrypted>
    // </Section>
  );
};

type GroupSectionProps = GroupInfoModalProps & {
  handleNextInformation: () => void;
  handlePreviousInformation?: () => void;
  pendingMemberPaginationData: MemberPaginationData;
  groupMembers: MembersType;
  setPendingMemberPaginationData: React.Dispatch<
    React.SetStateAction<MemberPaginationData>
  >;
  acceptedMemberPaginationData: MemberPaginationData;
  setAcceptedMemberPaginationData: React.Dispatch<
    React.SetStateAction<MemberPaginationData>
  >;
  membersCount: GroupParticipantCounts;
  setShowAddMoreWalletModal: React.Dispatch<React.SetStateAction<boolean>>;
};

type GroupInfoModalProps = {
  theme: IChatTheme;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
  groupInfo: Group;
  setGroupInfo: React.Dispatch<React.SetStateAction<Group|null>>;
  groupInfoModalBackground?: ModalBackgroundType;
  groupInfoModalPositionType?: ModalPositionType;
};

export const GROUPINFO_STEPS = {
  GROUP_INFO: 1,
  CRITERIA: 2,
} as const;

export type GROUP_INFO_TYPE =
  typeof GROUPINFO_STEPS[keyof typeof GROUPINFO_STEPS];

const GroupInformation = ({
  theme,
  groupInfo,
  handleNextInformation,
  pendingMemberPaginationData,
  setPendingMemberPaginationData,
  acceptedMemberPaginationData,
  setAcceptedMemberPaginationData,
  groupMembers,
  setShowAddMoreWalletModal,
  membersCount,
}: GroupSectionProps) => {
  const { account,user } = useChatData();
  const [accountStatus, setAccountStatus] = useState<ParticipantStatus | null>(
    null
  );
  const [showPendingRequests, setShowPendingRequests] =
    useState<boolean>(false);

  const [copyText, setCopyText] = useState<string>('');
  const isMobile = useMediaQuery(device.mobileL);
  const groupInfoToast = useToast();

  const { fetchMemberStatus } = useGroupMemberUtilities();

  useEffect(() => {
    if (account && groupInfo?.chatId) {
      (async () => {
        const status = await fetchMemberStatus({
          chatId: groupInfo?.chatId,
          accountId: account,
        });
        if (status && typeof status !== 'string') {
          setAccountStatus(status);
        } else {
          groupInfoToast.showMessageToast({
            toastTitle: 'Error',
            toastMessage: 'Error in fetching member details',
            toastType: 'ERROR',
            getToastIcon: (size) => <MdError size={size} color="red" />,
          });
        }
      })();
    }
  }, []);

  return (
    <ScrollSection
      margin="auto"
      width="100%"
      flexDirection="column"
      gap="16px"
      maxHeight={isMobile ? '59vh' : '60vh'}
      height={isMobile ? '59vh' : '60vh'}
      overflow="hidden auto"
      justifyContent="start"
      padding="0 2px 0 0"
      theme={theme}
    >
      <GroupDescription>
        <Span fontSize="18px" color={theme.textColor?.modalHeadingText}>
          Chat ID
        </Span>
        <Section
          gap="5px"
          alignSelf="start"
          onClick={() => {
            copyToClipboard(groupInfo!.chatId!);
            setCopyText('copied');
          }}
          onMouseEnter={() => {
            setCopyText('click to copy');
          }}
          onMouseLeave={() => {
            setCopyText('');
          }}
        >
          <Span
            textAlign="start"
            fontSize="16px"
            fontWeight="400"
            color={theme.textColor?.modalSubHeadingText}
          >
            {shortenText(groupInfo!.chatId!, 8, true)}
          </Span>
          {!!copyText && (
            <Span
              cursor="pointer"
              position="relative"
              padding="2px 10px"
              color={theme.textColor?.modalSubHeadingText}
              fontSize="14px"
              fontWeight="400"
              background={theme.backgroundColor?.modalHoverBackground}
              borderRadius="16px"
            >
              {copyText}
            </Span>
          )}
        </Section>
      </GroupDescription>
      <GroupDescription>
        <Span fontSize="18px" color={theme.textColor?.modalHeadingText}>
          Group Description
        </Span>
        <Span
          textAlign="start"
          fontSize="16px"
          fontWeight="400"
          color={theme.textColor?.modalSubHeadingText}
        >
          {groupInfo?.groupDescription}
        </Span>
      </GroupDescription>
      <GroupTypeBadge
        theme={theme}
        icon={
          <Image
            cursor="default"
            src={groupInfo?.isPublic ? LockIcon : LockSlashIcon}
            height="24px"
            maxHeight="24px"
            width={'auto'}
          />
        }
        header={groupInfo?.isPublic ? 'Open' : 'Encrypted'}
        subheader={
          groupInfo?.isPublic
            ? 'Chats are not encrypted'
            : 'Chats are end-to-end encrypted'
        }
      />
      {!!Object.keys(groupInfo?.rules || {}).length && (
        <GroupTypeBadge
          cursor="pointer"
          handleNextInformation={handleNextInformation}
          theme={theme}
          icon={<TokenGatedSvg />}
          header={'Gated group'}
          subheader={'Conditions must be true to join'}
        />
      )}

      {accountStatus?.role === GROUP_ROLES.ADMIN.toLowerCase() &&
        groupMembers?.accepted &&
        groupMembers?.accepted?.length < (groupInfo?.isPublic ? 25000 : 5000) && (
          <AddWalletContainer
            theme={theme}
            onClick={() => setShowAddMoreWalletModal(true)}
          >
            <Image
              cursor="pointer"
              src={addIcon}
              height="18px"
              maxHeight="18px"
              width={'auto'}
            />

            <Span
              cursor="pointer"
              color={theme.textColor?.modalSubHeadingText}
              margin="0px 14px"
              fontSize="16px"
              fontWeight="400"
            >
              Add more wallets
            </Span>
          </AddWalletContainer>
        )}

      <Section borderRadius="16px" flexDirection="column" gap="16px">
        {groupMembers.loading ? (
          <Spinner size="40" color={theme.spinnerColor} />
        ) : (
          <>
            {groupMembers &&
              groupMembers?.pending &&
              groupMembers?.pending?.length > 0 && (
                <PendingMembers
                  pendingMemberPaginationData={pendingMemberPaginationData}
                  setPendingMemberPaginationData={
                    setPendingMemberPaginationData
                  }
                  pendingMembers={groupMembers?.pending}
                  setShowPendingRequests={setShowPendingRequests}
                  showPendingRequests={showPendingRequests}
                  theme={theme}
                  count={membersCount.pending}
                />
              )}
            <AcceptedMembers
              acceptedMemberPaginationData={acceptedMemberPaginationData}
              setAcceptedMemberPaginationData={setAcceptedMemberPaginationData}
              acceptedMembers={groupMembers?.accepted}
              chatId={groupInfo!.chatId!}
            />
          </>
        )}
      </Section>
    </ScrollSection>
  );
};

export const GroupInfoModal = ({
  theme,
  setModal,
  setGroupInfo,
  groupInfo,
  groupInfoModalBackground = MODAL_BACKGROUND_TYPE.OVERLAY,
  groupInfoModalPositionType = MODAL_POSITION_TYPE.GLOBAL,
}: GroupInfoModalProps) => {
  const [activeComponent, setActiveComponent] = useState<GROUP_INFO_TYPE>(
    GROUPINFO_STEPS.GROUP_INFO
  );
  const [memberList, setMemberList] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [membersCount, setMembersCount] = useState<GroupParticipantCounts>({
    participants: 0,
    pending: 0,
  });
  const [showAddMoreWalletModal, setShowAddMoreWalletModal] =
    useState<boolean>(false);
  useState<boolean>(false);

  const [pendingMemberPaginationData, setPendingMemberPaginationData] =
    useState<MemberPaginationData>({
      page: 1,
      finishedFetching: false,
      loading: false,
      reset: false,
    });
  const [acceptedMemberPaginationData, setAcceptedMemberPaginationData] =
    useState<MemberPaginationData>({
      page: 1,
      finishedFetching: false,
      loading: false,
      reset: false,
    });

  const isMobile = useMediaQuery(device.mobileL);
  const groupInfoToast = useToast();
  const [groupMembers, setGroupMembers] = useState<MembersType>({
    accepted: [],
    pending: [],
    loading: false,
  });
  const { fetchMembers, loading: membersLoading } = useGroupMemberUtilities();
  const {user} = useChatData();
  const { addMember } = useUpdateGroup();
  const { fetchMembersCount } = useGroupMemberUtilities();
  const { fetchUserProfile } = useUserProfile();

  const {
    chatAcceptStream,
    chatRejectStream,
    participantRemoveStream,
    participantLeaveStream,
    participantJoinStream,
    groupUpdateStream,
    participantRoleChangeStream,
  } = usePushChatStream();

  //stream listeners
  useEffect(() => {
    if (
      Object.keys(chatAcceptStream).length > 0 &&
      chatAcceptStream.constructor === Object
    ) 
    transformAcceptedRequest(chatAcceptStream);
  }, [chatAcceptStream]);
  useEffect(() => {
    if (
      Object.keys(chatRejectStream).length > 0 &&
      chatRejectStream.constructor === Object
    ) 
    transformRejectedRequest(chatRejectStream);
  }, [chatRejectStream]);

  useEffect(() => {
    if (
      Object.keys(participantRemoveStream).length > 0 &&
      participantRemoveStream.constructor === Object
    ) 
    transformParticipantRemove(participantRemoveStream);
  }, [participantRemoveStream]);
  useEffect(() => {
    if (
      Object.keys(participantLeaveStream).length > 0 &&
      participantLeaveStream.constructor === Object
    ) 
    transformParticipantLeave(participantLeaveStream);
  }, [participantLeaveStream]);

  useEffect(() => {
    (async () => {
      if (
        Object.keys(participantJoinStream).length > 0 &&
        participantJoinStream.constructor === Object
      ) 
     await transformParticipantJoin(participantJoinStream);
    })();
   
  }, [participantJoinStream]);
  useEffect(() => {
    if (
      Object.keys(groupUpdateStream).length > 0 &&
      groupUpdateStream.constructor === Object
    ) 
    transformGroupDetails(groupUpdateStream);
  }, [groupUpdateStream]);

  useEffect(() => {
    if (
      Object.keys(participantRoleChangeStream).length > 0 &&
      participantRoleChangeStream.constructor === Object
    ) 
    transformRoleChange(participantRoleChangeStream);
  }, [participantRoleChangeStream]);
  useEffect(() => {
    (async () => {
      const count = await fetchMembersCount({ chatId: groupInfo!.chatId! });
      if (count) {
        setMembersCount(count);
      }
    })();
  }, []);
  //add dependencies
  useEffect(() => {
    (async () => {
      if(Object.keys(groupInfo || {}).length){
        setGroupMembers((prev) => ({ ...prev, loading: true }));
        await initialiseMemberPaginationData('pending', fetchPendingMembers);
        await initialiseMemberPaginationData('accepted', fetchAcceptedMembers);
        setGroupMembers((prev) => ({ ...prev, loading: false }));
      }
    
    })();
  }, [groupInfo]);

  useEffect(() => {
    (async () => {
      if (pendingMemberPaginationData?.page > 1)
        await callMembers(
          pendingMemberPaginationData?.page,
          setPendingMemberPaginationData,
          fetchPendingMembers
        );
    })();
  }, [pendingMemberPaginationData?.page]);

  useEffect(() => {
    (async () => {
      if (acceptedMemberPaginationData?.page > 1)
        await callMembers(
          acceptedMemberPaginationData?.page,
          setAcceptedMemberPaginationData,
          fetchAcceptedMembers
        );
    })();
  }, [acceptedMemberPaginationData?.page]);

  //convert fetchPendingMembers and fetchAcceptedMembers to single method and show errors
  const fetchPendingMembers = async (page: number): Promise<void> => {
    const fetchedPendingMembers = await fetchMembers({
      chatId: groupInfo!.chatId ,
      page: page,
      limit: PENDING_MEMBERS_LIMIT,
      pending: true,
    });
    if (!fetchedPendingMembers?.members.length)
      setPendingMemberPaginationData((prev: MemberPaginationData) => ({
        ...prev,
        finishedFetching: true,
      }));
    setGroupMembers((prevMembers: MembersType) => ({
      ...prevMembers,
      pending: [
        ...prevMembers!.pending,
        ...(fetchedPendingMembers?.members || [] as ChatMemberProfile[]),
      ]
        .slice()
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.address === item.address)
        ),
    }));
    
     
  };
  const fetchAcceptedMembers = async (page: number): Promise<void> => {
    const fetchedAcceptedMembers = await fetchMembers({
      chatId: groupInfo!.chatId,
      page: page,
      limit: ACCEPTED_MEMBERS_LIMIT,
    });
    if (!fetchedAcceptedMembers?.members.length)
    
      setAcceptedMemberPaginationData((prev: MemberPaginationData) => ({
        ...prev,
        finishedFetching: true,
      }));
    setGroupMembers((prevMembers: MembersType) => ({
      ...prevMembers,
      accepted: [
        ...prevMembers!.accepted,
        ...(fetchedAcceptedMembers?.members || [] as ChatMemberProfile[]),
      ]
        .slice()
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.address === item.address)
        ),
    }));
    
  };

  const initialiseMemberPaginationData = async (
    property: string,
    fetchMembers: (page: number) => Promise<void>
  ) => {
    if (!groupMembers[property as 'accepted' | 'pending'].length)
      await fetchMembers(1);
  };

  const removePendingMember = (items: string[]): void => {
    setGroupMembers((prevMembers: MembersType) => ({
      ...prevMembers,
      pending: [...groupMembers.pending!]
        .filter((item) => !items.includes(item.address!))
        .slice()
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.address === item.address)
        ),
    }));
  };

  const removeAcceptedMember = (items: string[]): void => {
    setGroupMembers((prevMembers: MembersType) => ({
      ...prevMembers,
      accepted: [...groupMembers.accepted!]
        .filter((item) => !items.includes(item.address!))
        .slice()
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.address === item.address)
        ),
    }));
  };
  const addAcceptedMember = (items: ChatMemberProfile[]): void => {
    setGroupMembers((prevMembers: MembersType) => ({
      ...prevMembers,
      accepted: [...items, ...groupMembers.accepted]
        .slice()
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.address === item.address)
        ),
    }));
  };
  const memberRoleChange = (item:any): void => {
    const acceptedMember:ChatMemberProfile[] = groupMembers?.accepted.map(member => member.address == item.to[0] ? {...member, role:item.newRole} : member);
    console.debug(acceptedMember)
    setGroupMembers((prevMembers: MembersType) => ({
      ...prevMembers,
      accepted: acceptedMember,
    }));
  };

  const transformAcceptedRequest = (item: any): void => {
    if (item?.meta?.group && groupInfo?.chatId === item?.chatId) {
      const acceptedMember: ChatMemberProfile | undefined =
        groupMembers?.pending?.find((member: ChatMemberProfile) => {
          return member?.address === item?.from;
        });
      if (acceptedMember) {
        addAcceptedMember([acceptedMember]);
        removePendingMember([acceptedMember?.address]);
      }
    }
  };
  const transformRejectedRequest = (item: any): void => {
    if (item?.meta?.group && groupInfo?.chatId === item?.chatId) {
      removePendingMember([item?.from]);
    }
  };
  const transformParticipantRemove = (item: any): void => {
    if (groupInfo?.chatId === item?.chatId) {
      removeAcceptedMember(item?.to);
      removePendingMember(item?.to);
    }
  };
  const transformParticipantLeave = (item: any): void => {
    if (groupInfo?.chatId === item?.chatId) {
      removeAcceptedMember([item?.from]);
      removePendingMember([item?.from]);
    }
  };
  const transformParticipantJoin = async (item: any): Promise<void> => {
    if (groupInfo?.chatId === item?.chatId) {
      const profile = await fetchUserProfile({ profileId: item?.from,user });
      const transformedProfile = transformIUserToChatMemberProfile(profile,true);
      addAcceptedMember([transformedProfile]);
    }
  };
 
  // const transformRequestSent = async(item: any): Promise<void> => {
  //   if (item?.meta?.group && groupInfo?.chatId === item?.chatId) {
  //     const userPromises = item?.to.map((member:string) => 
  //       fetchChatProfile({ profileId: member})
  //       .then((userRecord) => {
  //          return userRecord;
  //       })
  //       .catch(console.error)
  //    );
  //    const users = await resolvePromisesSeq(userPromises); 
  //    const transformedUsers = users.map((user)=>{return transformIUserToChatMemberProfile(user,false)});
  //    addAcceptedMember(transformedUsers);
  //   }
  // };

  const transformRoleChange = (item: any): void => {
    if ( groupInfo?.chatId === item?.chatId) {
      memberRoleChange(item)
     
    }
  };
  const transformGroupDetails = (item: any): void => {
    if ( groupInfo?.chatId === item?.chatId) {
      const updatedGroupInfo = groupInfo;
      if(updatedGroupInfo){
        updatedGroupInfo.groupName= item?.meta?.name;
        updatedGroupInfo.groupDescription=item?.meta?.description;
        updatedGroupInfo.groupImage=item?.meta?.image;
        updatedGroupInfo.groupCreator=item?.meta?.owner;
        updatedGroupInfo.isPublic=!item?.meta?.private;
        updatedGroupInfo.rules=item?.meta?.rules;
        setGroupInfo(updatedGroupInfo);
      }
     
    }
  };


  const callMembers = async (
    page: number,
    setMemberPaginationData: React.Dispatch<
      React.SetStateAction<MemberPaginationData>
    >,
    fetchMembers: (page: number) => Promise<void>
  ) => {
    try {
      setMemberPaginationData((prev: MemberPaginationData) => ({
        ...prev,
        loading: true,
      }));
      await fetchMembers(page);
    } catch (error) {
      console.log(error);
      setMemberPaginationData((prev: MemberPaginationData) => ({
        ...prev,
        loading: false,
      }));
    } finally {
      setMemberPaginationData((prev: MemberPaginationData) => ({
        ...prev,
        loading: false,
      }));
    }
  };

  const handleNextInfo = () => {
    setActiveComponent((activeComponent + 1) as GROUP_INFO_TYPE);
  };

  const handlePreviousInfo = () => {
    setActiveComponent((activeComponent - 1) as GROUP_INFO_TYPE);
  };
  const handleAddMember = async () => {
    try {
      setIsLoading(true);
      let adminResponse = {};
      let memberResponse = {};
      const admins = memberList
        .filter((member: any) => member.isAdmin)
        .map((member: any) => member.wallets);
      const members = memberList
        .filter((member: any) => !member.isAdmin)
        .map((member: any) => member.wallets);

      if (admins.length) {
        adminResponse = await addMember({
          memberList: memberList
            .filter((member: any) => member.isAdmin)
            .map((member: any) => member.wallets),
          chatId: groupInfo!.chatId!,
          role: GROUP_ROLES.ADMIN,
        });
      }
      if (members.length) {
        memberResponse = await addMember({
          memberList: memberList
            .filter((member: any) => !member.isAdmin)
            .map((member: any) => member.wallets),
          chatId: groupInfo!.chatId!,
          role: GROUP_ROLES.MEMBER,
        });
      }

      if (
        typeof adminResponse !== 'string' &&
        typeof memberResponse !== 'string'
      ) {
        groupInfoToast.showMessageToast({
          toastTitle: 'Success',
          toastMessage: 'Group Invitation sent',
          toastType: 'SUCCESS',
          getToastIcon: (size) => <MdCheckCircle size={size} color="green" />,
        });
      } else {
        groupInfoToast.showMessageToast({
          toastTitle: 'Error',
          toastMessage: 'Error in adding member',
          toastType: 'ERROR',
          getToastIcon: (size) => <MdError size={size} color="red" />,
        });
      }
    } catch (error) {
      console.error('Error', error);
      groupInfoToast.showMessageToast({
        toastTitle: 'Error',
        toastMessage: 'Please, try again',
        toastType: 'ERROR',
        getToastIcon: (size) => <MdError size={size} color="red" />,
      });
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case GROUPINFO_STEPS.GROUP_INFO:
        return (
          <GroupInformation
            handleNextInformation={handleNextInfo}
            theme={theme}
            setModal={setModal}
            groupInfo={groupInfo}
            setGroupInfo={setGroupInfo}
            groupMembers={groupMembers}
            pendingMemberPaginationData={pendingMemberPaginationData}
            setPendingMemberPaginationData={setPendingMemberPaginationData}
            acceptedMemberPaginationData={acceptedMemberPaginationData}
            setAcceptedMemberPaginationData={setAcceptedMemberPaginationData}
            setShowAddMoreWalletModal={setShowAddMoreWalletModal}
            membersCount={membersCount}
          />
        );
      case GROUPINFO_STEPS.CRITERIA:
        return <ConditionsInformation groupInfo={groupInfo} theme={theme} />;

      default:
        return (
          <GroupInformation
            handleNextInformation={handleNextInfo}
            theme={theme}
            setModal={setModal}
            groupInfo={groupInfo}
            setGroupInfo={setGroupInfo}
            groupMembers={groupMembers}
            pendingMemberPaginationData={pendingMemberPaginationData}
            setPendingMemberPaginationData={setPendingMemberPaginationData}
            acceptedMemberPaginationData={acceptedMemberPaginationData}
            setAcceptedMemberPaginationData={setAcceptedMemberPaginationData}
            setShowAddMoreWalletModal={setShowAddMoreWalletModal}
            membersCount={membersCount}
          />
        );
    }
  };

  const handlePrevious = () => {
    setShowAddMoreWalletModal(false);
  };

  const onClose = (): void => {
    setModal(false);
  };

  if (groupInfo) {
    return (
      <Modal
        clickawayClose={onClose}
        modalBackground={groupInfoModalBackground}
        modalPositionType={groupInfoModalPositionType}
      >
        {!showAddMoreWalletModal && (
          <Section
            margin="auto"
            width={isMobile ? '100%' : '410px'}
            flexDirection="column"
            gap="16px"
            padding={isMobile ? '0px auto' : '0px 10px'}
          >
            <ModalHeader
              handlePrevious={
                activeComponent === 2 ? handlePreviousInfo : undefined
              }
              title="Group Info"
              handleClose={onClose}
            />

            <GroupHeader>
              <Image
                src={groupInfo?.groupImage ?? ''}
                height="64px"
                maxHeight="64px"
                width={'auto'}
                borderRadius="16px"
              />

              <Section flexDirection="column" alignItems="flex-start" gap="5px">
                <Span
                  fontSize="20px"
                  fontWeight="500"
                  color={theme.textColor?.modalHeadingText}
                >
                  {groupInfo?.groupName}
                </Span>
                {/* <Span
                  fontSize="16px"
                  fontWeight="500"
                  color={theme.textColor?.modalSubHeadingText}
                >
                  {groupInfo?.members?.length} Members
                </Span> */}
              </Section>
            </GroupHeader>
            {renderComponent()}
          </Section>
        )}
        {showAddMoreWalletModal && (
          <AddWalletContent
            onSubmit={handleAddMember}
            handlePrevious={handlePrevious}
            onClose={onClose}
            memberList={memberList}
            handleMemberList={setMemberList}
            groupMembers={[...groupMembers.pending, ...groupMembers.accepted]}
            isLoading={isLoading}
            groupInfo={groupInfo}
          />
        )}
      </Modal>
    );
  } else {
    return null;
  }
};

//styles
const GroupHeader = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 19px;
`;

const GroupDescription = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: flex-start;
  gap: 5px;
`;

const PublicEncrypted = styled(Section)<{ alert?: boolean }>`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 12px;
  align-items: center;
  border: ${(props) =>
    props?.alert
      ? '1px solid #E93636'
      : props.theme.border.modalInnerComponents};
  border-radius: ${(props) => props.theme.borderRadius.modalInnerComponents};
  padding: 12px 16px;
  box-sizing: border-box;
  background: ${(props) => props.theme.backgroundColor.modalHoverBackground};
`;

const AddWalletContainer = styled.div`
  border: ${(props) => props.theme.border.modalInnerComponents};
  border-radius: ${(props) => props.theme.borderRadius.modalInnerComponents};
  width: 100%;
  padding: 20px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  cursor: pointer;
  align-items: center;
`;

const ConditionSection = styled(Section)<{ theme: IChatTheme }>`
  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.scrollbarColor};
    border-radius: 10px;
  }
  &::-webkit-scrollbar-button {
    height: 20px;
  }
  &::-webkit-scrollbar {
    width: 4px;
  }
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

//auto update members when an user accepts not done
