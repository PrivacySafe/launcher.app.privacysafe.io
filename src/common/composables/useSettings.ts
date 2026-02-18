/*
Copyright (C) 2024 - 2025 3NSoft Inc.

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { useAppStore } from '@/common/store/app.store';
import { storeToRefs } from 'pinia';
import { useAppsStore } from '@/common/store/apps.store';
import { inject, ref } from 'vue';
import {
  DIALOGS_KEY,
  DialogsPlugin,
  I18N_KEY,
  I18nPlugin,
  NOTIFICATIONS_KEY,
  NotificationsPlugin,
} from '@v1nt1248/3nclient-lib/plugins';
import { SettingsJSON } from '@/common/store/app/ui-settings';
import { readImageFileIntoDataURL, selectOneImageFileWithDialog } from '../utils/image-files';
import TurnAutologinOn from '../dialogs/turn-autologin-on.vue';
import { AvailableColorTheme } from '@/common/types';

export function useSettings() {
  const dialog = inject<DialogsPlugin>(DIALOGS_KEY)!;

  const appStore = useAppStore();
  const { updateSettings } = appStore;
  const { colorTheme, lang, allowShowingDevtool, customLogoSrc } = storeToRefs(appStore);

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

  function changeColorTheme(val: AvailableColorTheme) {
    if (colorTheme.value === val) {
      return;
    }

    updateAppConfig({
      colorTheme: val,
    });
  }

  function changeAllowShowingDevtool(val: boolean) {
    updateSettings({
      allowShowingDevtool: val,
    });
  }

  function wipeDataFromDevice() {
    w3n.system.platform?.wipeFromThisDevice();
  }

  async function addCustomLogo() {
    const imgFile = await selectOneImageFileWithDialog(
      $tr('dialog.select-logo-file.title'),
      $tr('dialog.select-logo-file.btn'),
      $tr,
    );
    if (imgFile) {
      updateSettings({
        customLogo: await readImageFileIntoDataURL(imgFile),
      });
    }
  }

  function removeCustomLogo() {
    updateSettings({
      customLogo: undefined,
    });
  }

  const autoLogin = ref(false);
  const autoLoginSetupOpened = ref(false);

  async function updateAutoLoginRef() {
    autoLogin.value = await w3n.system.userLogin!.isAutoLoginSet();
    autoLoginSetupOpened.value = false;
    console.log(`autoLogin.value -> ${autoLogin.value}`);
  }

  async function changeAutoLogin(enable: boolean) {
    console.log(`changeAutoLogin -> ${enable}`);
    if (enable) {
      autoLoginSetupOpened.value = true;

      const res = await dialog.$openDialog<string>(TurnAutologinOn, {
        dialogProps: {
          title: $tr('settings.dialog.autologin.title'),
        },
      });

      const { event, data } = res;

      if (event === 'confirm') {
        try {
          if (data) {
            await w3n.system.userLogin!.setAutoLogin(data, () => {
              /* empty */
            });
            $createNotice({
              type: 'success',
              content: $tr('settings.autologin.set.success'),
            });
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          $createNotice({
            type: 'error',
            content: $tr('settings.autologin.password_wrong'),
          });
        } finally {
          updateAutoLoginRef();
        }
      } else {
        updateAutoLoginRef();
      }

      autoLoginSetupOpened.value = false;
    } else {
      try {
        await w3n.system.userLogin!.removeAutoLogin();
      } finally {
        updateAutoLoginRef();
      }
    }
  }

  updateAutoLoginRef();

  return {
    $tr,
    lang,
    colorTheme,
    changeColorTheme,

    allowShowingDevtool,
    changeAllowShowingDevtool,

    autoUpdate,
    toggleAutoUpdate,

    customLogoSrc,
    addCustomLogo,
    removeCustomLogo,

    autoLogin,
    autoLoginSetupOpened,
    changeAutoLogin,

    wipeDataFromDevice,
  };
}
