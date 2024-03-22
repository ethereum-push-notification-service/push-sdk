import { useContext, useState } from 'react';

import { IUser } from '@pushprotocol/restapi';
import { MdError } from 'react-icons/md';

import useToast from '../reusables/NewToast';

import { findObject } from '../helpers/helper';
import { AddWallets } from '../reusables';
import { useChatData } from '../../../hooks';
import { pCAIP10ToWallet } from '../../../helpers';
import { AddWalletContentProps } from '../../../types';

export const AddGroupMembers = ({
  onSubmit,
  handlePrevious,
  onClose,
  memberList,
  handleMemberList,
  isLoading = false,
  isPublic,
}: AddWalletContentProps) => {
  const groupInfoToast = useToast();
  const { account } = useChatData();

  const addMemberToList = async (member: IUser) => {
    let errorMessage = '';
    if (
      pCAIP10ToWallet(member.wallets.toLowerCase()) ===
      pCAIP10ToWallet((account?? '').toLowerCase())
    )
    {
        errorMessage = 'Group Creator cannot be added as member';
    }
    if(findObject(member, memberList, 'wallets')){
        errorMessage = 'Address is already added';
    }
      if (errorMessage) {
       
        groupInfoToast.showMessageToast({
          toastTitle: 'Error',
          toastMessage: errorMessage,
          toastType: 'ERROR',
          getToastIcon: (size) => <MdError size={size} color="red" />,
        });
      } else {
        const updatedMemberList = memberList;
        updatedMemberList.push( { ...member, isAdmin: false }) 
        handleMemberList(updatedMemberList);
      }
  };

  return (
    <AddWallets
      title="Create Group"
      submitButtonTitle="Create Group"
      addMemberToList={addMemberToList}
      onClose={onClose}
      onSubmit={onSubmit}
      isLoading={isLoading}
      handlePrevious={handlePrevious}
      memberList={memberList}
      totalAllowedMembers={isPublic ? 25000 : 5000}
      handleMemberList={handleMemberList}
    />
  );
};