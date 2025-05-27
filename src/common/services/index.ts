/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { VueEventBus } from '@v1nt1248/3nclient-lib/plugins';
import { CachedAppFiles, CachedAppLaunchers, CachedSystemInfo } from './cached-system-info';
import { AppConfigsInternal, SystemSettings } from './ui-settings';
import { AppInfo, GlobalEvents } from '@/common/types';
import { AppDistInfoChecker, CachedAppDistributionInfo, CachedBundleDistributionInfo } from './app-distribution-info';

export let settingsService: AppConfigsInternal;

export async function initializationOfServices(emitter: VueEventBus<GlobalEvents>): Promise<void> {
  try {
    settingsService = await SystemSettings.makeInternalService();

    eventSink = emitter.emit.bind(emitter);

    const sysInfoSrc = new CachedSystemInfo();
    const appDistInfoSrc = new AppDistInfoChecker();
    userSystem = {
      getAppsInfoAndLaunchers: sysInfoSrc.getAppsInfoAndLaunchers.bind(sysInfoSrc),
      hasAppPacks: sysInfoSrc.hasAppPacks.bind(sysInfoSrc),
      getAppDistInfo: appDistInfoSrc.getAppDistInfo.bind(appDistInfoSrc),
      getBundleDistInfo: appDistInfoSrc.getBundleDistInfo.bind(appDistInfoSrc),
    };

    const files = new CachedAppFiles();
    getCachedAppFiles = files.getFileBytes.bind(files);

    appDistInfoSrc.init();
    sysInfoSrc.init();

    console.info('<- SERVICES ARE INITIALIZED ->');
  } catch (e) {
    console.error('# ERROR WHILE SERVICES INITIALISE # ', e);
  }
}

export let userSystem: {
  getAppsInfoAndLaunchers(refreshCache?: true): Promise<{
    cacheTS: number;
    launchers: CachedAppLaunchers[];
    apps: AppInfo[];
  }>;
  hasAppPacks(): Promise<boolean>;
  getAppDistInfo(appId: string, forceInfoDownload?: boolean): Promise<CachedAppDistributionInfo | undefined>;
  getBundleDistInfo(forceInfoDownload?: boolean): Promise<CachedBundleDistributionInfo | undefined>;
};

export type GlobalEventSink = VueEventBus<GlobalEvents>['emit'];
let eventSink: GlobalEventSink;
export function getGlobalEventsSink(): GlobalEventSink {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return eventSink as any;
}

export let getCachedAppFiles: (appId: string, version: string, path: string) => Promise<Uint8Array | undefined>;
