import React, { useContext, useEffect, useState } from 'react';
import {
  ISubscriptionManagerProps,
  WidgetErrorCodes,

} from './types';
import { Modal } from '../reusables';
import { Section, Span, Image, Spinner } from '../../reusables';
import styled from 'styled-components';
import CloseIcon from '../../../icons/close.svg';
import { ToastContainer } from 'react-toastify';
import { SubscribeComponent } from './SubscribeComponent';
import { InstallSnapComponent } from './InstallSnapComponent';
import {
  useManageChannelUtilities,
  useManageSubscriptionsUtilities,
  useWidgetData,
} from '../../../hooks';
import { getCAIPAddress, notifStrictUserSettingFromat } from '../helpers';
import { ThemeContext } from '../theme/ThemeProvider';
import { IWidgetTheme } from '../theme';
import { ManageNotficationsComponent } from './ManageNotificationComponent';
import * as PushAPI from '@pushprotocol/restapi';

/**
 * @interface IThemeProps
 * this interface is used for defining the props for styled components
 */
interface IThemeProps {
  theme: IWidgetTheme;
}
export const SUBSCRIPTION_MANAGER_STEP_KEYS = {
  SUBSCRIBE: 1,
  INSTALL_SNAP: 2,
  MANAGE_NOTIFICATIONS: 3,
} as const;

export type SubscriptionManagerStepKeys =
  typeof SUBSCRIPTION_MANAGER_STEP_KEYS[keyof typeof SUBSCRIPTION_MANAGER_STEP_KEYS];

export const SubscriptionManager: React.FC<ISubscriptionManagerProps> = (
  options: ISubscriptionManagerProps
) => {
  const { env, user,account } = useWidgetData();
  const theme = useContext(ThemeContext);

  const {
    channelAddress,
    modalBackground,
    modalPositionType,
    onClose,
    autoconnect = false,
  } = options || {};
  const formattedChannelAddress = getCAIPAddress(env, channelAddress);
  const [channelInfo, setChannelInfo] = useState();
  const [userSubscription, setUserSubscription] = useState<{channel:string,user_settings:PushAPI.NotificationSettingType[]}[]>([]);
  const [activeComponent, setActiveComponent] =
    useState<SubscriptionManagerStepKeys>(
      SUBSCRIPTION_MANAGER_STEP_KEYS.SUBSCRIBE
    );
  const {
    fetchChannelInfo,
    channelInfoError,
    channelInfoLoading,
    setChannelInfoError,
  } = useManageChannelUtilities();

  const { fetchUserSubscriptions, userSubscriptionLoading,setUserSubscriptionLoading } =
    useManageSubscriptionsUtilities();
console.debug(userSubscription)
  const handleNext = () => {
    if(activeComponent === SUBSCRIPTION_MANAGER_STEP_KEYS.MANAGE_NOTIFICATIONS)
    {
        setActiveComponent(SUBSCRIPTION_MANAGER_STEP_KEYS.SUBSCRIBE);
 
    }
    else
      setActiveComponent(SUBSCRIPTION_MANAGER_STEP_KEYS.INSTALL_SNAP);
  };
  useEffect(() => {
    (async () => {
      try {
        const info = await fetchChannelInfo({
          channelAddress: formattedChannelAddress,
        });
        const userSubscriptionResponse = await fetchUserSubscriptions({
          channelAddress: formattedChannelAddress,
        });

        if (userSubscriptionResponse) {
          setUserSubscription(userSubscriptionResponse);
        } 
        else{
            setUserSubscriptionLoading(false)
        }
        if (info) {
          setChannelInfo(info);
        }
        //  else {
      
        //   setChannelInfoError(
        //     WidgetErrorCodes.NOTIFICATION_WIDGET_CHANNEL_INFO_ERROR
        //   );
        // }
      } catch (e) {
        console.debug(e);
        setChannelInfoError(
          WidgetErrorCodes.NOTIFICATION_WIDGET_CHANNEL_INFO_ERROR
        );
      }
    })();
  }, [channelAddress,user,account,env]);
  useEffect(() => {
    if (userSubscription && userSubscription.length) {
      setActiveComponent(SUBSCRIPTION_MANAGER_STEP_KEYS.MANAGE_NOTIFICATIONS);
    } else {
      setActiveComponent(SUBSCRIPTION_MANAGER_STEP_KEYS.SUBSCRIBE);
    }
  }, [userSubscription]);

  const renderComponent = () => {
    switch (activeComponent) {
      case SUBSCRIPTION_MANAGER_STEP_KEYS.SUBSCRIBE:
        return (
          <SubscribeComponent
            handleNext={handleNext}
            autoconnect={autoconnect}
            channelAddress={formattedChannelAddress}
            channelInfo={channelInfo}
          />
        );
      case SUBSCRIPTION_MANAGER_STEP_KEYS.INSTALL_SNAP:
        return <InstallSnapComponent handleNext={handleNext} />;
      case SUBSCRIPTION_MANAGER_STEP_KEYS.MANAGE_NOTIFICATIONS:
        return (
          <ManageNotficationsComponent
            autoconnect={autoconnect}
            channelInfo={channelInfo}
            channelAddress={formattedChannelAddress}
            userSettings={notifStrictUserSettingFromat({settings:userSubscription[0]?.user_settings})}
            handleNext={handleNext}
          />
        );
      default:
        return (
          <SubscribeComponent
            handleNext={handleNext}
            channelAddress={formattedChannelAddress}
            channelInfo={channelInfo}
          />
        );
    }
  };
  return (
    <Modal
      clickawayClose={onClose}
      modalBackground={modalBackground}
      modalPositionType={modalPositionType}
    >
      <Container
        theme={theme}
        flexDirection="column"
        alignItems="center"
        gap="10px"
        minHeight="154px"
        minWidth="374px"
        overflow="hidden auto"
        justifyContent={(channelInfoLoading || userSubscriptionLoading)?'center':'start'}
        background={theme.backgroundColor?.modalBackground}
        borderRadius={theme.borderRadius?.modal}
        padding="15px 20px"
      >
        <Section position="absolute" top="10px" right="10px">
          <Image
            src={CloseIcon}
            height="20px"
            maxHeight="20px"
            width={'auto'}
            onClick={onClose}
            cursor="pointer"
          />
        </Section>
        {channelInfoError ? (
          <Span margin="20px" color={theme.textColor?.modalTitleText}>
           Error in fetching details
          </Span>
        ) : (channelInfoLoading || userSubscriptionLoading) ? (
          <Span margin="20px">
            <Spinner color={theme?.spinnerColor} size="35" />
          </Span>
        ) : channelInfo ? (
          renderComponent()
        ) : null}
      </Container>

      <ToastContainer />
    </Modal>
  );
};

//styles
const Container = styled(Section)<IThemeProps>`
  border: ${(props) => props.theme.border?.modal};
`;

