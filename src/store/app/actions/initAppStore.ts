/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { SystemSettings } from '@/services/ui-settings';
import type { AppActions } from '@/store/app/actions/types';

const connectivityCheckMillis = 3000;

export const initAppStore: AppActions['initAppStore'] = async function (this) {
  await Promise.all([

    // info from settings, starting settings service on the way
    SystemSettings.makeInternalService()
    .then(async config => {
      const {
        lang, autoUpdate, colorTheme
      } = (await config.getSettingsFile()).currentConfig;
      this.lang = lang;
      this.autoUpdate = autoUpdate;
      this.setColorTheme(colorTheme);
    }),

    // platform info
    w3n.system!.platform!.getCurrentVersion()
    .then(platformInfo => {
      this.platform.version = platformInfo.bundle;
      this.platform.bundledApps = platformInfo.apps;
      this.platform.bundledAppPacks = platformInfo['app-packs'];
    }),

    // user info
    w3n.mailerid!.getUserId()
    .then(userId => {
      this.user = userId;
    }),

    // connectivity info (pull only functionality at this moment)
    this.refreshConnectivityStatus()
    .then(() => {
      setInterval(
        () => this.refreshConnectivityStatus(),
        connectivityCheckMillis
      );
    }),

  ]).catch(e => console.error('App store init error: ', e));
};
