/*
 Copyright (C) 2024 - 2025 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { getCachedAppFiles, userSystem } from "@/services";
import { CachedAppLaunchers } from "@/services/cached-system-info";
import { AppInfo, AppLaunchers, Launcher } from "@/types";
import { toRO } from "@/utils/readonly";
import { ref } from "vue";
import { compare as compareSemVer } from 'semver';
import { PlatformInfo } from "./platform";

export function makeAppsAndLaunchersInfoPlace() {

  const appLaunchers = ref<AppLaunchers[]>([]);
  const cacheTS = ref(0);
  const applicationsInSystem = ref<AppInfo[]>([]);

  function getApp(appId: string): AppInfo {
    const app = applicationsInSystem.value.find(
      ({ appId: id }) => (id === appId)
    );
    if (!app) {
      throw new Error(`Can't find app wit id ${appId}`);
    }
    return app;
  }

  async function fetchAppsInfo(platform: PlatformInfo) {
    const {
      cacheTS: dataTS, launchers, apps
    } = await userSystem.getAppsInfoAndLaunchers(true);
    if (cacheTS.value === dataTS) {
      return;
    }
    const diffVersions = await captureRunningAppsWithNonCurrentVersion(apps);
    await updateAppInfos(apps, diffVersions);
    await updateAppLaunchers(launchers, diffVersions);
    cacheTS.value = dataTS;
    checkForAppUpdatesFromBundledPacks(platform);
  }

  function checkForAppUpdatesFromBundledPacks(platform: PlatformInfo): void {
    for (const [
      appId, version
    ] of Object.entries(platform.bundledAppPacks)) {
      const currentVersion = appLaunchers.value.find(
        app => (app.appId === appId)
      )?.version;
      if (currentVersion && (compareSemVer(version, currentVersion) > 0)) {
        const app = getApp(appId);
        app.updateFromBundle = version;
      }
    }
  }
  
  async function updateAppInfos(
    apps: AppInfo[], diffVersions: { [appId: string]: string; }
  ): Promise<void> {
    // remove or update items in appsInSys, removing processed
    // entries from apps array.
    for (let i=0; i<applicationsInSystem.value.length; i+=1) {
      const { appId, versions } = applicationsInSystem.value[i];
      const indOfApp = apps.findIndex(l => (l.appId === appId));
      if (indOfApp < 0) {
        applicationsInSystem.value.splice(i, 1);
        i -= 1;
      } else if (areVersionsSame(apps[indOfApp].versions, versions)) {
        apps.splice(indOfApp, 1);
      } else {
        const app = apps.splice(indOfApp, 1)[0];
        applicationsInSystem.value[i] = await appInfoFrom(app, diffVersions[app.appId]);
      }
    }
    // put the rest of launchers array into appLaunchers as these are new
    // launcher entries.
    for (let app of apps) {
      applicationsInSystem.value.push(
        await appInfoFrom(app, diffVersions[app.appId])
      );
    }
    // beautify
    applicationsInSystem.value.sort(byName);
    const contactsAppInd = applicationsInSystem.value.findIndex(
      ({ appId }) => (appId === 'contacts.app.privacysafe.io')
    );
    if (contactsAppInd > 0) {
      const contactsApp = applicationsInSystem.value.splice(contactsAppInd, 1)[0];
      applicationsInSystem.value.unshift(contactsApp);
    }
  }

  async function updateAppLaunchers(
    launchers: CachedAppLaunchers[], diffVersions: { [appId: string]: string; }
  ): Promise<void> {
    // remove or update launchers in appLaunchers, removing processed
    // entries from launchers array.
    for (let i=0; i<appLaunchers.value.length; i+=1) {
      const { appId, version } = appLaunchers.value[i];
      const indOfApp = launchers.findIndex(l => (l.appId === appId));
      if (indOfApp < 0) {
        appLaunchers.value.splice(i, 1);
        i -= 1;
      } else if (launchers[indOfApp].version === version) {
        launchers.splice(indOfApp, 1);
      } else {
        const launchersInfo = launchers.splice(indOfApp, 1)[0];
        appLaunchers.value[i] = await appLaunchersFromInfo(
          launchersInfo, diffVersions[appId]
        );
      }
    }
    // put the rest of launchers array into appLaunchers as these are new
    // launcher entries.
    for (let info of launchers) {
      appLaunchers.value.push(await appLaunchersFromInfo(
        info, diffVersions[info.appId]
      ));
    }
    // beautify
    appLaunchers.value.sort(byName);
    const contactsAppInd = appLaunchers.value.findIndex(
      ({ appId }) => (appId === 'contacts.app.privacysafe.io')
    );
    if (contactsAppInd > 0) {
      const contactsLauncher = appLaunchers.value.splice(contactsAppInd, 1)[0];
      appLaunchers.value.unshift(contactsLauncher);
    }
  }

  return {
    cacheTS: toRO(cacheTS),
    appLaunchers,
    applicationsInSystem,

    getApp,
    fetchAppsInfo
  };
}

function areVersionsSame(
  v1: AppInfo['versions'], v2: AppInfo['versions']
): boolean {
  if ((v1.current !== v2.current)
  || (v1.bundled !== v2.bundled)
  || (v1.latest !== v2.latest)) {
    return false;
  }
  if (!Array.isArray(v1.packs)) {
    return !Array.isArray(v2.packs);
  } else if (!Array.isArray(v2.packs)
  || (v1.packs.length !== v2.packs.length)) {
    return false;
  }
  for (const vp1 of v1.packs) {
    if (!v2.packs.includes(vp1)) {
      return false;
    }
  }
  return true;
}

function byName(a: { name: string; }, b: { name: string; }): -1|0|1 {
  const aName = a.name.toLowerCase();
  const bName = b.name.toLowerCase();
  if (aName < bName) {
    return -1;
  } else if (aName > bName) {
    return 1;
  } else {
    return 0;
  }
}

async function appInfoFrom(
  info: AppInfo, diffRunningVersion: string|undefined
): Promise<AppInfo> {
  const { appId, name, description, icon, versions } = info;
  const iconBytes = (icon ?
    await getCachedAppFiles(appId, versions.latest, icon) : undefined
  );
  return {
    appId, name, description, icon, versions, iconBytes
  };
}

async function appLaunchersFromInfo(
  info: CachedAppLaunchers, diffRunningVersion: string|undefined
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

async function captureRunningAppsWithNonCurrentVersion(
  apps: AppInfo[]
): Promise<{ [appId: string]: string; }> {
  const diffVersions: { [appId: string]: string; } = {};
  const runningInstances = await w3n.system!.monitor!.listProcs();
  for (const instance of runningInstances) {
    const app = apps.find(({ appId }) => (instance.appId === appId));
    if (app && (app.versions.current !== instance.version)) {
      diffVersions[app.appId] = instance.version;
    }
  }
  return diffVersions;
}
