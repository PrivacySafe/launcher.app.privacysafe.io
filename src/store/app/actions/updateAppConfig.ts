import type { AppActions } from '@/store/app/actions/types';
import { type SettingsJSON, UISettings } from '@/services/ui-settings';

export const updateAppConfig: AppActions['updateAppConfig'] = async function (appConfig: Partial<SettingsJSON>) {
  const config = await UISettings.makeInternalService();
  const updatedAppConfig = {
    lang: this.lang,
    colorTheme: this.colorTheme,
    ...appConfig,
  };
  try {
    await config.saveSettingsFile({
      currentConfig: updatedAppConfig,
    });

    if (updatedAppConfig.lang !== this.lang) {
      this.setLang(updatedAppConfig.lang);
    }
    if (updatedAppConfig.colorTheme !== this.colorTheme) {
      this.setColorTheme(updatedAppConfig.colorTheme);
    }

    this.$createNotice({
      type: 'success',
      content: this.$i18n.tr('app.settings.save.success'),
    });
  } catch (e) {
    console.error('The apps settings save error: ', e);
    this.$createNotice({
      type: 'error',
      content: this.$i18n.tr('app.settings.save.error'),
    });
  }
};
