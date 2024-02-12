import { NotificationSettingType, UserSetting } from '@pushprotocol/restapi';

const isSettingType1 = (setting: NotificationSettingType) => setting.type === 1;

export const notifUserSettingFormatString = ({
  settings,
}: {
  settings: NotificationSettingType[];
}) => {
  const _notifSettings: UserSetting[] = [];
  settings &&
    settings.forEach((setting) =>
      isSettingType1(setting)
        ? _notifSettings.push({
            enabled: setting?.userPreferance?.enabled || false,
          })
        : _notifSettings.push({
            value: setting?.userPreferance?.value,
            enabled: setting?.userPreferance?.enabled || false,
          })
    );
  return _notifSettings;
};

export const notifUserSettingFromChannelSetting = ({
  settings
}: {
  settings: any[];
}) => {
    console.debug(settings)
  const _userSettings: NotificationSettingType[] = [];
  settings &&
    settings.forEach((setting) =>
      isSettingType1(setting)
        ? _userSettings.push({
            ...setting,
            userPreferance: {
              value: undefined,
              enabled: setting.default,
            },
          })
        : _userSettings.push({
            ...setting,
            userPreferance: {
              value: setting.default,
              enabled: setting.enabled,
            },
            data: {
              upper: setting.upperLimit,
              lower: setting.lowerLimit,
              ticker: setting.ticker,
            },
          })
    );
  return _userSettings;
};
