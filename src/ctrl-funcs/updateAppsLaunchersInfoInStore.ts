/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { CachedAppLaunchers } from '../services/cached-system-info';
import { AppLaunchers, Launcher } from '@/types';
import { cacheSystemInfo, getCachedAppFiles } from '@/services';
import { useAppStore } from '@/store';

export const updateAppsLaunchersInfoInStore = async function (
  refreshCache?: true
): Promise<void> {

  const appStore = useAppStore();

  if (refreshCache) {
    await cacheSystemInfo.refreshAppVersions();
  }
  let { cacheTS, launchers } = await cacheSystemInfo.getAppLaunchers();
  if (appStore.launchersCacheTS === cacheTS) {
    return;
  }

  for (let i=0; i<appStore.appLaunchers.length; i+=1) {
    const { appId, version } = appStore.appLaunchers[i];
    const indOfApp = launchers.findIndex(l => (l.appId === appId));
    if (indOfApp < 0) {
      appStore.appLaunchers.splice(i, 1);
      i -= 1;
    } else if (launchers[indOfApp].version === version) {
      launchers.splice(indOfApp, 1);
    } else {
      const launchersInfo = launchers.splice(indOfApp, 1)[0];
      appStore.appLaunchers[i] = await appLaunchersFromInfo(launchersInfo);
    }
  }

  for (let info of launchers) {
    appStore.appLaunchers.push(await appLaunchersFromInfo(info));
  }

  appStore.appLaunchers.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    if (aName < bName) {
      return -1;
    } else if (aName > bName) {
      return 1;
    } else {
      return 0;
    }
  });

};

async function appLaunchersFromInfo(
  info: CachedAppLaunchers
): Promise<AppLaunchers> {
  const { appId, version, name, description, icon } = info;
  const iconBytes = (icon ?
    await getCachedAppFiles(appId, version, icon) : undefined
  );
  const defaultLauncher = (info.defaultLauncher ?
    await appLauncherFromInfo(appId, version, info.defaultLauncher) : undefined
  );
  const staticLaunchers: AppLaunchers['staticLaunchers'] = [];
  if (info.staticLaunchers) {
    for (const l of  info.staticLaunchers) {
      staticLaunchers.push(await appLauncherFromInfo(appId, version, l));
    }
  }
  // XXX dynamic launchers array is empty, till it gets implemented
  const dynamicLaunchers: AppLaunchers['dynamicLaunchers'] = [];
  return {
    appId, version, name, description, icon, iconBytes,
    dynamicLaunchers, staticLaunchers, defaultLauncher
  };
}

async function appLauncherFromInfo(
  appId: string, version: string, {
    description, icon, name, component, formFactor, startCmd
  }: web3n.caps.Launcher
): Promise<Launcher> {
  const iconBytes = (icon ?
    await getCachedAppFiles(appId, version, icon) : undefined
  );
  return {
    description, icon, name, component, formFactor, startCmd, iconBytes
  };
}
