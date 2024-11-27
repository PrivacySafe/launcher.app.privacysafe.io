/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { useAppStore, useProcessStore } from "@/store";
import { checkForAllUpdates } from "./checkForAllUpdates";
import { updateAppsAndLaunchersInfoInStore } from "./updateAppsAndLaunchersInfoInStore";
import { downloadAndInstallApp } from "./downloadAndInstallApp";
import { ProcessStore } from "@/store/process/types";
import { AppStore } from "@/store/app/types";
import { downloadPlatformUpdate } from "./downloadPlatform";

/**
 * This "controller" function checks for updates and installs all available.
 * It will restart only idle (i.e. without current connections) background
 * processes, while everything else should be restarted by user's action.
 */
export async function checkAndInstallAllUpdates(
  applyUpdates?: boolean
): Promise<void> {
  const appStore = useAppStore();
  const processStore = useProcessStore();

  await checkForAllUpdates();

  if (applyUpdates || appStore.autoUpdate) {
    await downloadAndInstallAllAppUpdates(appStore, processStore);
    await downloadPlatformUpdate(appStore, processStore);
  }
}

async function downloadAndInstallAllAppUpdates(
  appStore: AppStore, processStore: ProcessStore
): Promise<void> {

  const appsAndVersionsToInstall = appStore.applicationsInSystem
  .filter(app => !!app.updates)
  .map(app => ({
    app,
    version: app.updates![0].version
  }));

  const appsToRestart: string[] = [];

  for (const { app, version } of appsAndVersionsToInstall) {
    const postInstallState = await downloadAndInstallApp(
      app, version, processStore
    );
    if (postInstallState
    && (postInstallState !== 'all-done')) {
      appsToRestart.push(app.appId);
    }
  }

  appStore.setAppsRestart(
    (appsToRestart.length > 0) ? appsToRestart : undefined
  );

  await updateAppsAndLaunchersInfoInStore();

}
