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
import { DIALOGS_KEY, DialogsPlugin, I18N_KEY, NOTIFICATIONS_KEY } from '@v1nt1248/3nclient-lib/plugins';
import { SettingsJSON } from '@/common/store/app/ui-settings';
import { readImageFileIntoDataURL, selectOneImageFileWithDialog } from '../utils/image-files';
import TurnAutologinOn from '../dialogs/turn-autologin-on.vue'
import { sleep } from '@v1nt1248/3nclient-lib/utils';

export function useSettings() {
  const dialog = inject<DialogsPlugin>(DIALOGS_KEY)!;

  const appStore = useAppStore();
  const { updateSettings } = appStore;
  const { colorTheme, lang, systemFoldersDisplaying, allowShowingDevtool, customLogoSrc } = storeToRefs(appStore);

  const appsStore = useAppsStore();
  const { toggleAutoUpdate } = appsStore;
  const { autoUpdate } = storeToRefs(appsStore);

  const { $createNotice } = inject(NOTIFICATIONS_KEY)!;
  const { $tr } = inject(I18N_KEY)!;

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

  function changeSystemFoldersDisplaying(val: boolean) {
    updateSettings({
      systemFoldersDisplaying: val,
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
      $tr('dialog.select-logo-file.title'), $tr('dialog.select-logo-file.btn'), $tr
    );
    if (imgFile) {
      updateSettings({
        customLogo: await readImageFileIntoDataURL(imgFile),
      });
    }
  }

  function removeCustomLogo() {
    updateSettings({
      customLogo: undefined
    });
  }

  const autoLogin = ref(false);
  const autoLoginSetupOpened = ref(false);
  async function updateAutoLoginRef() {
    autoLogin.value = await w3n.system.userLogin!.isAutoLoginSet();
    autoLoginSetupOpened.value = false;
    console.log(`autoLogin.value -> ${autoLogin.value}`);
  }
  updateAutoLoginRef();

  async function changeAutoLogin(enable: boolean) {
    // if (await w3n.system.userLogin!.isAutoLoginSet()) {
    //   try {
    //     await w3n.system.userLogin!.removeAutoLogin();
    //   } finally {
    //     updateAutoLoginRef();
    //   }
    // } else {
    if (enable) {
      autoLoginSetupOpened.value = true;
      const loginPassword = ref('');
      dialog.$openDialog<typeof TurnAutologinOn>({
        component: TurnAutologinOn,
        componentProps: {
          loginPassword
        },
        dialogProps: {
          title: $tr('settings.dialog.autologin.title'),
          // cancelButton: false,
          // confirmButton: false,
          onConfirm: async () => {
            try {
              if (loginPassword.value) {
                await w3n.system.userLogin!.setAutoLogin(loginPassword.value, () => {});
                $createNotice({
                  type: 'success',
                  content: $tr('settings.autologin.set.success'),
                });
              }
            } catch (err) {
              $createNotice({
                type: 'error',
                content: $tr('settings.autologin.password_wrong'),
              });
            } finally {
              updateAutoLoginRef();
            }
          },
          onCancel: updateAutoLoginRef,
          onClose: updateAutoLoginRef
        }
      });
    } else {
      try {
        await w3n.system.userLogin!.removeAutoLogin();
      } finally {
        updateAutoLoginRef();
      }
    }
  }

  return {
    $tr,

    lang,

    colorTheme,
    changeColorTheme,

    systemFoldersDisplaying,
    changeSystemFoldersDisplaying,

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
