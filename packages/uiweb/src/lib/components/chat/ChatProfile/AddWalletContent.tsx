import { useContext, useState } from 'react';

import { ChatMemberProfile, IUser } from '@pushprotocol/restapi';
import { MdError } from 'react-icons/md';

import useToast from '../reusables/NewToast';

import { Group, } from '../exportedTypes';
import { addWalletValidation } from '../helpers/helper';
import {
  AddWallets,
} from '../reusables';
import useGroupMemberUtilities from '../../../hooks/chat/useGroupMemberUtilities';

type AddWalletContentProps = {
  onSubmit: () => void;
  onClose: () => void;
  handlePrevious: () => void;
  memberList: any;
  handleMemberList: any;
  groupMembers: ChatMemberProfile[];
  isLoading?: boolean;
  groupInfo: Group;
};
export const AddWalletContent = ({
  onSubmit,
  handlePrevious,
  onClose,
  memberList,
  handleMemberList,
  groupMembers,
  isLoading = false,
  groupInfo,
}: AddWalletContentProps) => {

  const { fetchMemberStatus } = useGroupMemberUtilities();
  const groupInfoToast = useToast();
  
  const addMemberToList = async (member: IUser) => {
    let errorMessage = '';
    const memberStatus = await fetchMemberStatus({
      chatId: groupInfo!.chatId!,
      accountId: member!.wallets,
    });
    errorMessage = addWalletValidation(
      member,
      memberList,
      groupMembers,
      memberStatus!,
      groupInfo?.isPublic ? 25000 : 5000
    );

    if (errorMessage) {
      groupInfoToast.showMessageToast({
        toastTitle: 'Error',
        toastMessage: errorMessage,
        toastType: 'ERROR',
        getToastIcon: (size) => <MdError size={size} color="red" />,
      });
    } else {
      handleMemberList((prev: any) => [...prev, { ...member, isAdmin: false }]);
    }
  };

  return (
    <AddWallets
      title="Add More Wallets"
      submitButtonTitle="Add To Group"
      addMemberToList={addMemberToList}
      onClose={onClose}
      onSubmit={onSubmit}
      isLoading={isLoading}
      handlePrevious={handlePrevious}
      memberList={memberList}
      totalAllowedMembers={groupInfo?.isPublic ? 25000 : 5000}
      handleMemberList={handleMemberList}
      groupMembers={groupMembers}
    />
  );
};




