/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { CachedAppFiles, CachedAppLaunchers, CachedSystemInfo } from './cached-system-info';
import { AppConfigsInternal, UISettings } from './ui-settings';

export let settingsService: AppConfigsInternal;

export async function initializationServices() {
  try {
    settingsService = await UISettings.makeInternalService();
    console.info('\n--- initializationServices DONE---\n');
  } catch (e) {
    console.error('\nERROR into initializationServices: ', e);
  }
}


export let cacheSystemInfo: {
  refreshAppVersions(): Promise<number>;
  getAppLaunchers(): Promise<{
    cacheTS: number; launchers: CachedAppLaunchers[];
  }>;
}

export let getCachedAppFiles: (
  appId: string, version: string, path: string
) => Promise<Uint8Array|undefined>;

export async function initServices(): Promise<void> {
  const sysInfoSrc = new CachedSystemInfo();
  cacheSystemInfo = {
    getAppLaunchers: sysInfoSrc.getAppLaunchers.bind(sysInfoSrc),
    refreshAppVersions: sysInfoSrc.refreshAppVersions.bind(sysInfoSrc)
  };
  const files = new CachedAppFiles();
  getCachedAppFiles = files.getFileBytes.bind(files);

  sysInfoSrc.init();
}
