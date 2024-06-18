import { NotificationSettingType } from '../types/index';

export const parseSettings = (settings: any): NotificationSettingType[] => {
  let settingsObj;
  try {
    settingsObj = JSON.parse(settings);
  } catch (error) {
    settingsObj = settings;
  }
  const parsedSettings: NotificationSettingType[] = [];
  for (let i = 0; i < settingsObj.length; i++) {
    const setting = settingsObj[i];
    if (setting.type == 1) {
      parsedSettings.push({
        type: setting.type,
        description: setting.description,
        ...(setting.user
          ? {
              userPreferance: {
                value: setting.user,
                enabled: setting.user,
              },
            }
          : { default: setting.default }),
      });
    } else if (setting.type == 2) {
      parsedSettings.push({
        type: setting.type,
        description: setting.description,
        data: {
          upper: setting.upperLimit,
          lower: setting.lowerLimit,
          ticker: setting.ticker ?? 1,
        },
        ...(setting.user
          ? {
              userPreferance: {
                value: setting.user,
                enabled: setting.enabled,
              },
            }
          : { default: setting.default }),
      });
    } else if (setting.type == 3) {
      parsedSettings.push({
        type: setting.type,
        description: setting.description,
        data: {
          upper: setting.upperLimit,
          lower: setting.lowerLimit,
          ticker: setting.ticker ?? 1,
        },
        ...(setting.user
          ? {
              userPreferance: {
                value: setting.user,
                enabled: setting.enabled,
              },
            }
          : { default: setting.default }),
      });
    }
  }

  return parsedSettings;
};
