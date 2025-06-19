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

import { toRO } from '@/common/utils/readonly';
import { SystemSettings } from '@/common/services/ui-settings';
import { AvailableColorTheme, AvailableLanguage } from '@/common/types';
import { ref } from 'vue';

export function useSystemLevelAppConfig() {
  const appVersion = ref<string>('');
  const user = ref<string>('');
  const lang = ref<AvailableLanguage>('en');
  const colorTheme = ref<AvailableColorTheme>('default');
  const systemFoldersDisplaying = ref(false);
  const allowShowingDevtool = ref(false);

  function setLang(value: AvailableLanguage) {
    lang.value = value;
  }

  function setColorTheme(theme: AvailableColorTheme) {
    colorTheme.value = theme;
    const htmlEl = document.querySelector('html');
    if (!htmlEl) return;

    const prevColorThemeCssClass = theme === 'default' ? 'dark-theme' : 'default-theme';
    const curColorThemeCssClass = theme === 'default' ? 'default-theme' : 'dark-theme';
    htmlEl.classList.remove(prevColorThemeCssClass);
    htmlEl.classList.add(curColorThemeCssClass);
  }

  function setSystemFoldersDisplaying(value: boolean) {
    systemFoldersDisplaying.value = value;
  }

  function setAllowShowingDevtool(value: boolean) {
    allowShowingDevtool.value = value;
  }

  let unsubFromConfigWatch: (() => void) | undefined = undefined;

  async function readAndStartWatchingAppConfig() {
    try {
      const config = await SystemSettings.makeResourceReader();
      const lang = await config.getCurrentLanguage();
      const colorTheme = await config.getCurrentColorTheme();
      const flagValue = await config.getSystemFoldersDisplaying();
      const allowShowingDevtoolValue = await config.getAllowShowingDevtool();
      setColorTheme(colorTheme);
      setSystemFoldersDisplaying(flagValue);
      setAllowShowingDevtool(allowShowingDevtoolValue);

      unsubFromConfigWatch = config.watchConfig({
        next: appConfig => {
          const { lang, colorTheme, systemFoldersDisplaying, allowShowingDevtool } = appConfig;
          setLang(lang);
          setColorTheme(colorTheme);
          setSystemFoldersDisplaying(!!systemFoldersDisplaying);
          setAllowShowingDevtool(!!allowShowingDevtool);
        },
      });
    } catch (e) {
      console.error('Load the app config error: ', e);
    }
  }

  async function initialize(): Promise<void> {
    await Promise.all([
      w3n.myVersion().then(v => {
        appVersion.value = v;
      }),

      w3n.mailerid!.getUserId().then(addr => {
        user.value = addr;
      }),

      readAndStartWatchingAppConfig(),
    ]);
  }

  async function stopWatching() {
    unsubFromConfigWatch?.();
  }

  return {
    appVersion: toRO(appVersion),
    user: toRO(user),
    lang: toRO(lang),
    colorTheme: toRO(colorTheme),
    systemFoldersDisplaying: toRO(systemFoldersDisplaying),
    allowShowingDevtool: toRO(allowShowingDevtool),

    initialize,
    stopWatching,
  };
}
