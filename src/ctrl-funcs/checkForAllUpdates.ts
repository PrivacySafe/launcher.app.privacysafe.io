/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { userSystem } from "@/services";
import { useAppStore, useProcessStore } from "@/store";
import { AppStore } from "@/store/app/types";
import { ProcessStore } from "@/store/process/types";
import { AppInfo, ChannelVersion } from "@/types";
import { debouncedFnCall } from "@/utils";
import { compare as compareSemVer } from 'semver';

type BundleVersions = web3n.system.platform.BundleVersions;

/**
 * This "controller" function checks all installed apps for updates.
 * It updates apps' info in AppStore.
 */
export const checkForAllUpdates = debouncedFnCall(async (
  forceInfoDownload = false
): Promise<void> => {

  const appStore = useAppStore();
  const processStore = useProcessStore();

  const installedApps = appStore.applicationsInSystem
  .filter(({ versions: { current } }) => !!current);
  for (const app of installedApps) {
    await checkAppUpdates(app, processStore, forceInfoDownload);
  }

  await checkPlatformUpdates(appStore, processStore, forceInfoDownload);

});

async function checkAppUpdates(
  app: AppInfo, processStore: ProcessStore, forceInfoDownload: boolean
): Promise<void> {
  const { appId, versions: { latest: current } } = app;
  processStore.upsertProcess(appId, {
    procType: 'update-checking'
  });
  try {

    const distInfo = await userSystem.getAppDistInfo(appId, forceInfoDownload);
    if (!distInfo) {
      app.updates = undefined;
      return;
    }

    const updateOpts: NonNullable<AppInfo['updates']> = [];
    for (const [ channel, version ] of Object.entries(distInfo.versions)) {
      if (compareSemVer(current, version) < 0) {
        updateOpts.push({ channel, version });
      }
    }
    if (updateOpts.length > 0) {
      app.updates = updateOpts;
    } else if (app.updates) {
      app.updates = undefined;
    }

  } finally {
    processStore.delProcess(appId, 'update-checking');
  }
}

async function checkPlatformUpdates(
  appStore: AppStore, processStore: ProcessStore, forceInfoDownload: boolean
): Promise<void> {
  processStore.upsertProcess(null, {
    procType: 'update-checking'
  });
  try {

    const distInfo = await userSystem.getBundleDistInfo(forceInfoDownload);
    if (!distInfo) {
      return;
    }

    const currentVer = await w3n.system!.platform!.getCurrentVersion();
    const updateOpts: ChannelVersion[] = [];
    for (const [
      channel, latestChannelVer
    ] of Object.entries(distInfo.versions)) {
      if (canUpdateBundle(currentVer, latestChannelVer)) {
        updateOpts.push({ channel, version: latestChannelVer.bundle });
      }
    }
    if (updateOpts.length > 0) {
      appStore.platform.availableUpdates = updateOpts;
    }

  } finally {
    processStore.delProcess(null, 'update-checking');
  }
}

function canUpdateBundle(
  current: BundleVersions, latestAvailable: BundleVersions
): boolean {
  const platDiff = compareSemVer(current.platform, latestAvailable.platform);
  if (platDiff < 0) {
    return true;
  } else if (platDiff > 0) {
    return false;
  }

  const currBundleNum = parseInt(
    current.bundle.substring(current.bundle.indexOf('+')+1)
  );
  const latestBundleNum = parseInt(
    latestAvailable.bundle.substring(latestAvailable.bundle.indexOf('+')+1)
  );
  if (currBundleNum >= latestBundleNum) {
    return false;
  }

  for (const [appId, version] of Object.entries(latestAvailable.apps)) {
    const currVer = current.apps[appId];
    if ((currVer === undefined)
    || (compareSemVer(currVer, version) < 0)) {
      return true;
    }
  }

  return false;
}
