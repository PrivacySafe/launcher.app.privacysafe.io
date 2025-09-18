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
import { inject } from 'vue';
import { I18N_KEY, NOTIFICATIONS_KEY } from '@v1nt1248/3nclient-lib/plugins';
import { SettingsJSON } from '@/common/store/app/ui-settings';
import { readImageFileIntoDataURL, selectOneImageFileWithDialog } from '../utils/image-files';

export function useSettings() {
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

  return {
    $tr,
    colorTheme,
    lang,
    systemFoldersDisplaying,
    allowShowingDevtool,
    autoUpdate,
    customLogoSrc,
    changeColorTheme,
    changeSystemFoldersDisplaying,
    changeAllowShowingDevtool,
    toggleAutoUpdate,
    wipeDataFromDevice,
    addCustomLogo,
    removeCustomLogo
  };
}
