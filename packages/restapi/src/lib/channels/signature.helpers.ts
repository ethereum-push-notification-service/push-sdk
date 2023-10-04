type channelActionType = 'Unsubscribe' | 'Subscribe';

export const getDomainInformation = (
  chainId: number,
  verifyingContract: string
) => {
  return {
    name: 'EPNS COMM V1',
    chainId,
    verifyingContract,
  };
};

export const getSubscriptionMessage = (
  channel: string,
  userAddress: string,
  action: channelActionType
) => {
  const actionTypeKey =
    action === 'Unsubscribe' ? 'unsubscriber' : 'subscriber';

  return {
    channel,
    [actionTypeKey]: userAddress,
    action: action,
  };
};

export const getSubscriptionMessageV2 = (
  channel: string,
  userAddress: string,
  action: channelActionType,
  userSetting?: string
) => {
  const actionTypeKey =
    action === 'Unsubscribe' ? 'unsubscriber' : 'subscriber';
  if (action == 'Subscribe') {
    return JSON.stringify({
      channel,
      [actionTypeKey]: userAddress,
      action: action,
      userSetting: userSetting?? '',
    });
  } else {
    return JSON.stringify({
      channel,
      [actionTypeKey]: userAddress,
      action: action,
    });
  }
};

export const getTypeInformation = (action: string) => {
  if (action === 'Subscribe') {
    return {
      Subscribe: [
        { name: 'channel', type: 'address' },
        { name: 'subscriber', type: 'address' },
        { name: 'action', type: 'string' },
      ],
    };
  }

  return {
    Unsubscribe: [
      { name: 'channel', type: 'address' },
      { name: 'unsubscriber', type: 'address' },
      { name: 'action', type: 'string' },
    ],
  };
};

export const getTypeInformationV2 = () => {
  return {
    Data: [{ name: 'data', type: 'string' }],
  };
};
