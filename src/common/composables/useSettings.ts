import { useAppStore } from '@/common/store/app.store';
import { storeToRefs } from 'pinia';
import { useAppsStore } from '@/common/store/apps.store';
import { inject } from 'vue';
import { I18N_KEY, I18nPlugin, NOTIFICATIONS_KEY, NotificationsPlugin } from '@v1nt1248/3nclient-lib/plugins';
import { SettingsJSON } from '@/common/services/ui-settings';

export function useSettings() {
  const appStore = useAppStore();
  const { updateSettings } = appStore;
  const { colorTheme, lang } = storeToRefs(appStore);

  const appsStore = useAppsStore();
  const { toggleAutoUpdate } = appsStore;
  const { autoUpdate } = storeToRefs(appsStore);

  const { $createNotice } = inject<NotificationsPlugin>(NOTIFICATIONS_KEY)!;
  const { $tr } = inject<I18nPlugin>(I18N_KEY)!;

  async function updateAppConfig(appConfig: Partial<SettingsJSON>) {
    try {
      await updateSettings(appConfig);
      $createNotice({
        type: 'success',
        content: $tr('settings.save.success'),
      });
    } catch (e) {
      console.error('Settings saving error: ', e);
      $createNotice({
        type: 'error',
        content: $tr('settings.save.error'),
      });
    }
  }

  function changeColorTheme(isDarkColorTheme: boolean) {
    updateAppConfig({
      colorTheme: isDarkColorTheme ? 'dark' : 'default',
    });
  }

  return {
    $tr,
    colorTheme,
    lang,
    autoUpdate,
    changeColorTheme,
    toggleAutoUpdate,
  };
}
