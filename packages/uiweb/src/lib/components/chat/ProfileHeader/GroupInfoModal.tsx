import { useRef, useState } from "react";
import styled from "styled-components";
import { useChatData, useClickAway } from "../../../hooks";
import { IGroup } from "../../../types";
import { IChatTheme } from "../theme";
import * as PushAPI from '@pushprotocol/restapi';
import { IToast, ShadowedProps, UpdateGroupType } from "../exportedTypes";
import { convertToWalletAddressList, getAdminList, getUpdatedAdminList, getUpdatedMemberList } from "../helpers/helper";
import { DropdownValueType } from "./DropDown";
import DismissAdmin from '../../../icons/dismissadmin.svg';
import AddAdmin from '../../../icons/addadmin.svg';
import Remove from '../../../icons/remove.svg';
import { Section, Span, Image } from "../../reusables/sharedStyling";
import CloseIcon from '../../../icons/close.svg';
import { ProfileCard } from "./ProfileCard";
import addIcon from '../../../icons/addicon.svg';
import { pCAIP10ToWallet, shortenText } from "../../../helpers";
import LockIcon from '../../../icons/Lock.png'
import LockSlashIcon from '../../../icons/LockSlash.png'
import { AddWalletContent } from './AddWalletContent'
import ArrowIcon from '../../../icons/CaretDown.svg'
import { Modal } from "../helpers/Modal";
import { device } from "../../../config";
import useMediaQuery from "../helpers/useMediaQuery";



const PendingMembers = ({ groupInfo, setShowPendingRequests, showPendingRequests, theme }: {groupInfo?: IGroup | null, setShowPendingRequests: React.Dispatch<React.SetStateAction<boolean>>, showPendingRequests: boolean, theme: IChatTheme }) => {
    if(groupInfo){
    return (
        <PendingRequestWrapper
        theme={theme}
        >
        <PendingSection onClick={() => setShowPendingRequests(!showPendingRequests)}>
            <Span fontSize='18px'>Pending Requests</Span>
            <Badge>{groupInfo?.pendingMembers?.length}</Badge>

                <ArrowImage src={ArrowIcon} height="20px" maxHeight="20px" width={'auto'} setPosition={showPendingRequests} borderRadius='100%' />
                {/* <ArrowImage src={theme === 'light' ? ArrowGreyIcon : ArrowIcon} height="20px" maxHeight="20px" width={'auto'} setPosition={showPendingRequests} borderRadius='100%' /> */}
        </PendingSection>

    {showPendingRequests && (
        <Section margin='0px 15px 15px 15px' flexDirection='column' flex='1'>
        {groupInfo?.pendingMembers && groupInfo?.pendingMembers?.length > 0 && groupInfo?.pendingMembers.map((item) => (
             <GroupPendingMembers>
                    <Image src={item?.image} height="36px" maxHeight="36px" width={'auto'} borderRadius='100%' />

                    <Span margin='0 0 0 10px'>
                         {shortenText(item?.wallet?.split(':')[1] ?? '', 6, true)}
                    </Span>

             </GroupPendingMembers>
        ))}
    </Section>
    )}
    </PendingRequestWrapper>
    )
} else {return null }
}


export const GroupInfoModal = ({theme, modal, setModal, groupInfo, setGroupInfo, showToast, setShowToast, toastInfo, setToastInfo}: {theme: IChatTheme, modal: boolean, setModal: React.Dispatch<React.SetStateAction<boolean>>, groupInfo: IGroup, setGroupInfo: React.Dispatch<React.SetStateAction<IGroup | null | undefined>>, showToast: boolean, setShowToast: React.Dispatch<React.SetStateAction<boolean>>, toastInfo: IToast, setToastInfo: React.Dispatch<React.SetStateAction<IToast>> }) => {
    const { account, env, pgpPrivateKey } = useChatData();
    const [showAddMoreWalletModal, setShowAddMoreWalletModal] = useState<boolean>(false);
    const [showPendingRequests, setShowPendingRequests] = useState<boolean>(false);
    const [memberList, setMemberList] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedMemberAddress, setSelectedMemberAddress] = useState<string | null>(null);

    const handleClose = () => onClose();
    const dropdownRef = useRef<any>(null);
     useClickAway(dropdownRef, () => setSelectedMemberAddress(null));
    // const groupInfoToast = useToast();


    const groupCreator = groupInfo?.groupCreator;
    const membersExceptGroupCreator = groupInfo?.members?.filter((x) => x.wallet?.toLowerCase() !== groupCreator?.toLowerCase());
    const groupMembers = [...membersExceptGroupCreator, ...groupInfo.pendingMembers];


    const updateGroup = async(options:UpdateGroupType) => {
        const { groupInfo, connectedUser,adminList,memberList } = options;
        const updateResponse = await PushAPI.chat.updateGroup({
            chatId: groupInfo?.chatId,
            groupName: groupInfo?.groupName,
            groupDescription: groupInfo?.groupDescription ?? '',
            groupImage: groupInfo?.groupImage,
            members: memberList,
            admins: adminList,
            account: connectedUser?.wallets,
            pgpPrivateKey: pgpPrivateKey,
            env: env,
        });
        let updatedCurrentChat = null;
        if(typeof updateResponse !== 'string')
        {
            updatedCurrentChat = groupInfo;
            updatedCurrentChat = updateResponse;
        }
            return {updateResponse,updatedCurrentChat};
    }

    const addMembers = async () => {
        //Already Present Members and PendingMembers
        const groupMemberList = convertToWalletAddressList([
          ...groupInfo.members,
          ...groupInfo.pendingMembers,
        ]);
    
        //Newly Added Members and alreadyPresent Members in the groupchat
        const newMembersToAdd = memberList.map((member: any) => member.wallets);
        const members = [...groupMemberList, ...newMembersToAdd];
    
        //Admins wallet address from both members and pendingMembers
        const adminList = getAdminList?.(groupInfo);
        
    
        try {
          setIsLoading(true);
          const connectedUser = await PushAPI.user.get({ account: account as string, env });
          const { updateResponse, updatedCurrentChat } = await updateGroup({
            groupInfo,
            connectedUser,
            adminList,
            memberList: members,
          });
    
            if (typeof updateResponse !== 'string') {
            setSelectedMemberAddress(null);
            setGroupInfo(updateResponse);
          } else {
            setToastInfo({
              message: updateResponse,
              status: 'error'
            })
            setSelectedMemberAddress(null);
          }
          setIsLoading(false);
          setToastInfo({
            message: 'Group Invitation sent!',
            status: 'success'
          })
          handleClose();
        } catch (error) {
          setIsLoading(false);
          console.log('Error', error);
          setToastInfo({
            message: 'Error',
            status: 'error'
          })
        }
      };
    
 
    const makeGroupAdmin = async () => {
        const groupMemberList = convertToWalletAddressList([
          ...groupInfo.members,
          ...groupInfo.pendingMembers,
        ]);
        const newAdminList = getUpdatedAdminList(groupInfo, selectedMemberAddress, false);
        try {
          const connectedUser = await PushAPI.user.get({ account: account as string, env });
          const { updateResponse, updatedCurrentChat } = await updateGroup({
            groupInfo,
            connectedUser,
            adminList: newAdminList,
            memberList: groupMemberList,
          });
          if (typeof updateResponse !== 'string') {
            setSelectedMemberAddress(null);
            setGroupInfo(updateResponse);
            setToastInfo({
              message: 'Admin Added Successfully',
              status: 'success'
            })
          } else {
            setToastInfo({
              message: updateResponse,
              status: 'error'
            })
            setSelectedMemberAddress(null);
          }
        } catch (e) {
          console.error('Error while adding admin', e);
          setToastInfo({
            message: 'Error',
            status: 'error'
          })
        }
        setSelectedMemberAddress(null);
      };
    
      const dismissGroupAdmin = async () => {
        const groupMemberList = convertToWalletAddressList([
          ...groupInfo.members,
          ...groupInfo.pendingMembers,
        ]);
        const newAdminList = getUpdatedAdminList(groupInfo, selectedMemberAddress, true);
        try {
          const connectedUser = await PushAPI.user.get({ account: account as string, env });
          const { updateResponse, updatedCurrentChat } = await updateGroup({
            groupInfo,
            connectedUser,
            adminList: newAdminList,
            memberList: groupMemberList,
          });
          if (typeof updateResponse !== 'string') {
            setSelectedMemberAddress(null);
            setGroupInfo(updateResponse);
            setToastInfo({
              message: 'Admin Successfully removed',
              status: 'success'
            })
          } else {
            setToastInfo({
              message: updateResponse,
              status: 'error'
            })
            setSelectedMemberAddress(null);
          }
        } catch (e) {
          console.error('Error while dismissing admin', e);
          setToastInfo({
            message: 'Error',
            status: 'error'
          })
        }
        setSelectedMemberAddress(null);
      };
    
      const removeMember = async () => {
        const updatedMemberList = getUpdatedMemberList(groupInfo, selectedMemberAddress!);
        const adminList = getUpdatedAdminList(groupInfo, selectedMemberAddress, true);
        try {
          const connectedUser = await PushAPI.user.get({ account: account as string, env });
          const { updateResponse, updatedCurrentChat } = await updateGroup({
            groupInfo,
            connectedUser,
            adminList,
            memberList: updatedMemberList,
          });
    
          if (typeof updateResponse !== 'string') {
            setSelectedMemberAddress(null);
            setGroupInfo(updateResponse);
          } else {
            setToastInfo({
              message: updateResponse,
              status: 'error'
            })
            setSelectedMemberAddress(null);
          }
        } catch (error) {
          console.error('Error in removing member', error);
          setToastInfo({
            message: 'Error',
            status: 'error'
          })
        }
        setSelectedMemberAddress(null);
      };

         // const messageUserDropdown: DropdownValueType = {
    //     id: 'message_user',
    //     title: 'Message user',
    //     icon: Message,
    //     function: () => messageUser(),
    //   };
      const removeAdminDropdown: DropdownValueType = {
        id: 'dismiss_admin',
        title: 'Dismiss as admin',
        icon: DismissAdmin,
        function: () => dismissGroupAdmin(),
      };
      const addAdminDropdown: DropdownValueType = {
        id: 'add_admin',
        title: 'Make group admin',
        icon: AddAdmin,
        function: () => makeGroupAdmin(),
      };
      const removeMemberDropdown: DropdownValueType = {
        id: 'remove_member',
        title: 'Remove',
        icon: Remove,
        function: () => removeMember(),
        textColor: '#ED5858',
      };


    
    const isAccountOwnerAdmin = groupInfo?.members?.some(
        (member) => pCAIP10ToWallet(member?.wallet)?.toLowerCase() === account?.toLowerCase() && member?.isAdmin
      );

    const handlePrevious = () => {
        setShowAddMoreWalletModal(false);
    };

    const handleCloseAddWalletModal = () => {
        setShowAddMoreWalletModal(false);
      };
    
    const onClose = () => {
        setModal(false);
    }

    const isMobile = useMediaQuery(device.mobileL);
    if(groupInfo){
    return(
    <Modal clickawayClose={onClose}>
     {!showAddMoreWalletModal && (<Section width={isMobile ? '100%' : '410px'} flexDirection='column' padding={isMobile ? '0px auto' :'0px 10px'}>
        <Section flex='1' flexDirection='row' justifyContent='space-between'>

        <div></div>

        <Span textAlign='center' fontSize='20px'>Group Info</Span>

        <Image src={CloseIcon} height="24px" maxHeight="24px" width={'auto'}  onClick={()=>onClose()} cursor='pointer' />
        </Section>

        <GroupHeader>
            <Image src={groupInfo?.groupImage ?? ''} height="64px" maxHeight="64px" width={'auto'} borderRadius="16px" />

            <Section flexDirection='column' alignItems='flex-start' gap='5px'>
                <Span fontSize='20px'>{groupInfo?.groupName}</Span>
                <Span fontSize='16px'>{groupInfo?.members?.length} Members</Span>
            </Section>
        </GroupHeader>

        <GroupDescription>
            <Span fontSize='18px'>Group Description</Span>
            <Span fontSize='18px'>{groupInfo?.groupDescription}</Span>
        </GroupDescription>

        <PublicEncrypted theme={theme}>
            <Image src={groupInfo?.isPublic ? LockIcon : LockSlashIcon} height="24px" maxHeight="24px" width={'auto'} />

            <Section flexDirection='column' alignItems='flex-start' gap='5px'>
                <Span fontSize='18px'>{groupInfo?.isPublic ? 'Public' : 'Private'}</Span>
                <Span fontSize='12px'>{groupInfo?.isPublic ? 'Chats are not encrypted' : 'Chats are encrypted'}</Span>
            </Section>
        </PublicEncrypted>

        {isAccountOwnerAdmin && groupInfo?.members && groupInfo?.members?.length < 10 && (
        <AddWalletContainer theme={theme}
        onClick={() => setShowAddMoreWalletModal(true)}
        >
              <Image src={addIcon} height="18px" maxHeight="18px" width={'auto'} />

              <Span
                color={theme.textColorSecondary}
                margin="0px 14px"
                fontSize="16px"
                fontWeight="400"
              >
                Add more wallets
              </Span>
        </AddWalletContainer>)}

    <Section>
        {groupInfo?.pendingMembers?.length > 0 && (
            <PendingMembers
              groupInfo={groupInfo}
              setShowPendingRequests={setShowPendingRequests}
              showPendingRequests={showPendingRequests}
              theme={theme}
            />
          )}
    </Section>

    <Section margin='15px 10px' flexDirection='column' flex='1'>
        {groupInfo?.members && groupInfo?.members?.length > 0 && groupInfo?.members.map((item, index) => (
            <ProfileCard
                    key={index}
                    member={item}
                    dropdownValues={
                      item?.isAdmin && isAccountOwnerAdmin
                        ? [removeAdminDropdown, removeMemberDropdown]
                        : isAccountOwnerAdmin
                        ? [addAdminDropdown, removeMemberDropdown]
                        : []
                    }
                    selectedMemberAddress={selectedMemberAddress}
                    setSelectedMemberAddress={setSelectedMemberAddress}
                    dropdownRef={dropdownRef}
                  />
        ))}
    </Section>
    
 </Section>)} 



 {showAddMoreWalletModal && (
    <AddWalletContent 
        onSubmit={addMembers}
        handlePrevious={handlePrevious}
        onClose={onClose}
        memberList={memberList}
        handleMemberList={setMemberList}
        // handleClose={handleCloseAddWalletModal}
        title={'Add More Wallets'}
        groupMembers={groupMembers}
        isLoading={isLoading}
        setToastInfo={setToastInfo}
    />
 )}
    </Modal>
    )
} else { return null }

}

const GroupHeader = styled.div`
    margin-top: 34px;
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 19px;   
`;

const GroupDescription = styled.div`
    margin-top: 34px;
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: flex-start;
    gap: 5px;   
`;


const PublicEncrypted = styled.div`
    margin-top: 20px;
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 19px;  
    align-items: center;
    border: ${(props) => props.theme.dropdownBorderColor};
    border-radius: 16px;
    padding: 16px;
    box-sizing: border-box;
`;

const GroupMembers = styled.div`
    margin-top: 20px;
    display: flex;
    flex-direction: row;
    width: 100%;
    align-items: center;
`;

const AdminItem = styled.div`
    background: rgb(244, 220, 234);
    color: rgb(213, 58, 148);
    margin-left: auto;
    font-size: 10px;
    padding: 6px;
    border-radius: 8px;
`;

const AddWalletContainer = styled.div`
    margin-top: 20px;
    border: ${(props) => props.theme.dropdownBorderColor};
    border-radius: 16px;
    width: 100%;
    padding: 20px 16px;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: center;
    cursor: pointer;
    align-items: center;
`;

const GroupPendingMembers = styled.div`
    margin-top: 10px;
    display: flex;
    flex-direction: row;
    width: 100%;
    align-items: center;
`;


const PendingRequestWrapper = styled.div`
    width: 100%;
    margin-top: 20px;
    border: ${(props) => props.theme.dropdownBorderColor};
    border-radius: 16px;
    padding: 0px 0px;
    box-sizing: border-box;
`;

const PendingSection = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    flex: 1;
    cursor: pointer;
    padding: 15px 20px;
    box-sizing: border-box;
`;

const ArrowImage = styled(Image)<ShadowedProps>`
    margin-left: auto;
    transform: ${(props) => props?.setPosition ? 'rotate(0)' : 'rotate(180deg)'};
`;


const Badge = styled.div`
    margin: 0 0 0 5px; 
    font-size: 13px;
    background: rgb(207, 28, 132);
    padding: 4px 8px;
    border-radius: 7px;
    color: white;
    font-weight: 700;
`;
