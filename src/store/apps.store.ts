/*
 Copyright (C) 2024 - 2025 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { defineStore } from "pinia";
import { makeProcessesPlace } from "./apps/processes";
import { AppInfo } from '@/types';
import { downloadApp, installApp } from './apps/app-operations';
import { SingleProc, defer, makeSyncedFunc } from '@v1nt1248/3nclient-lib/utils';
import { ref } from "vue";
import { makeRestartInfoPlace } from "./apps/restart-info";
import { makeAppsAndLaunchersInfoPlace } from "./apps/apps-and-launchers-info";
import { makePlatform } from "./apps/platform";
import { debouncedFnCall } from "@/utils/debounce";
import { checkAppUpdates, checkPlatformUpdates } from "./apps/checking-updates";
import { getGlobalEventsSink, userSystem } from "@/services";
import { toRO } from "@/utils/readonly";


type PostInstallState = web3n.system.apps.PostInstallState;

export const useAppsStore = defineStore('apps', () => {

  const { processes, delProcess, upsertProcess } = makeProcessesPlace();

  const autoUpdate = ref(true);
  const {
     appLaunchers, applicationsInSystem, getApp, fetchAppsInfo
  } = makeAppsAndLaunchersInfoPlace();
  const {
    restart, setAppsRestart, setPlatformRestart
  } = makeRestartInfoPlace();
  const {
    platform, downloadPlatformUpdate
  } = makePlatform(
    delProcess, upsertProcess, restart, setPlatformRestart
  );

  function toggleAutoUpdate(): void {
    autoUpdate.value = !autoUpdate.value;
    // XXX we need to save this to file, but don't have to wait here
  
  }

  async function initialize(): Promise<void> {
    // XXX read autoUpdate value from some value, or set default value

    platform.value.version = (await w3n.system!.platform!.getCurrentVersion()).bundle;

  }

  const downloadAndInstallApp = debouncedFnCall(
    async function downloadAndInstallApp(
      app: AppInfo, version: string
    ): Promise<PostInstallState|undefined> {
      try {
    
        if (!app.versions.packs
        || !app.versions.packs.includes(version)) {
        await downloadApp(app.appId, version, delProcess, upsertProcess);
        }
    
        return await installApp(app.appId, version, delProcess, upsertProcess);
    
      } catch (err) {
        w3n.log('error', `Failed to download and install app ${app.appId} version ${version}`);
      }
    }
  );
  
  async function unpackBundledApp(appId: string): Promise<void> {
    const deferred = defer<void>();
    upsertProcess(appId, {
      procType: 'unzipping', progressValue: 0
    });
    w3n.system!.apps!.installer!.unpackBundledApp(appId, {
      next: ev => {
      const { numOfFiles, numOfProcessed } = ev;
      const progressValue = Math.floor(numOfProcessed/numOfFiles*100);
      upsertProcess(appId, {
        procType: 'unzipping', progressValue
      });
      },
      complete: () => {
      deferred.resolve();
      },
      error: err => deferred.reject(err)
    });
    try {
      await deferred.promise;
    } finally {
      delProcess(appId, 'unzipping');
    }
  }
  
  const installBundledApp = debouncedFnCall(
    async function installBundledApp(
      appId: string, version: string
    ): Promise<void> {
      try {
        await unpackBundledApp(appId);
        await installApp(appId, version, delProcess, upsertProcess);
      } catch (err) {
        w3n.log('error', `Failed to install app ${appId} version ${version}`);
      } finally {
        await updateAppsAndLaunchersInfo();
      }
    },
    (appId: string) => appId
  );

  const checkForAllUpdates = debouncedFnCall(
    async function checkForAllUpdates (
      forceInfoDownload = false
    ): Promise<void> {
      const installedApps = applicationsInSystem.value
      .filter(({ versions: { current } }) => !!current);
      for (const app of installedApps) {
        await checkAppUpdates(
          app, forceInfoDownload, delProcess, upsertProcess
        );
      }
      await checkPlatformUpdates(
        platform.value, forceInfoDownload, delProcess, upsertProcess
      );
    }
  );

  async function checkAndInstallAllUpdates(
    applyUpdates?: boolean
  ): Promise<void> {
    await checkForAllUpdates();
    if (applyUpdates || autoUpdate.value) {
      await downloadAndInstallAllAppUpdates();
      await downloadPlatformUpdate();
    }
  }
  
  async function downloadAndInstallAllAppUpdates(): Promise<void> {
  
    const appsAndVersionsToInstall = applicationsInSystem.value
    .filter(app => !!app.updates)
    .map(app => ({
      app,
      version: app.updates![0].version
    }));
  
    const appsToRestart: string[] = [];
  
    for (const { app, version } of appsAndVersionsToInstall) {
      const postInstallState = await downloadAndInstallApp(app, version);
      if (postInstallState
      && (postInstallState !== 'all-done')) {
        appsToRestart.push(app.appId);
      }
    }
  
    setAppsRestart(
      (appsToRestart.length > 0) ? appsToRestart : undefined
    );
  
    await updateAppsAndLaunchersInfo();
  }

  const closeOldVersionApps = debouncedFnCall(async () => {
    const appsToClose = restart.value?.apps;
    if (!appsToClose) {
      return;
    }
    setAppsRestart(undefined);
    if (appsToClose.length === 0) {
      return;
    }
    await w3n.system!.apps!.opener!.closeAppsAfterUpdate(appsToClose);
  });

  const updateAppsAndLaunchersInfo = makeSyncedFunc(
    new SingleProc(), undefined,
    async () => {
      await fetchAppsInfo(platform.value);
      if ((appLaunchers.value.length === 0)
      && (await userSystem.hasAppPacks())) {
        // trigger installation in a new system, which will call this func again
        installBundledAppsIntoNewSystem();
        return;
      }
    }
  );

  const installBundledAppsIntoNewSystem = debouncedFnCall(async () => {
    const {
      "app-packs": appPacks
    } = await w3n.system!.platform!.getCurrentVersion();
    const bundledAppsForInstall = Object.entries(appPacks)
    .map(([ id, version ]) => ({ id, version }));
  
    if (bundledAppsForInstall.length === 0) {
      // there is nothing to install
      return;
    }
  
    const $emit = getGlobalEventsSink();
  
    $emit('init-setup:start', {
      bundledAppsForInstall: bundledAppsForInstall.map(({ id }) => id)
    });
  
    const installProcs = bundledAppsForInstall
    .map(({ id, version }) => installBundledApp(id, version))
    .map(proc => proc.then(updateAppsAndLaunchersInfo).catch(noop));
  
    await Promise.all(installProcs);
  
    $emit('init-setup:done', null);
  
    w3n.system!.apps!.opener!.triggerAllStartupLaunchers();
  
    updateAppsAndLaunchersInfo();
  });

  return {
    autoUpdate: toRO(autoUpdate),
    appLaunchers: toRO(appLaunchers),
    applicationsInSystem: toRO(applicationsInSystem),
    platform: toRO(platform),
    restart,  // is readonly already
    processes,  // is readonly already

    getApp,
    toggleAutoUpdate,
    initialize,

    downloadAndInstallApp,
    installBundledApp,
    downloadPlatformUpdate,
    checkForAllUpdates,
    checkAndInstallAllUpdates,
    closeOldVersionApps,
    updateAppsAndLaunchersInfo
  };
});

export type AppsStore = ReturnType<typeof useAppsStore>;

function noop() {}
