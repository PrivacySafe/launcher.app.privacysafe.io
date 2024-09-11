import { UISettings } from '@/services/ui-settings';
import type { AppActions } from '@/store/app/actions/types';

export const getAppConfig: AppActions['getAppConfig'] = async function (this) {
  try {
    const config = await UISettings.makeInternalService();
    const lang = await config.getCurrentLanguage();
    const colorTheme = await config.getCurrentColorTheme();
    this.setLang(lang);
    this.setColorTheme(colorTheme);
    return config;
  } catch (e) {
    console.error('Load the app config error: ', e);
  }
};
