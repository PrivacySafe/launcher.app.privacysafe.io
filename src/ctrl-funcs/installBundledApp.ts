/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { useProcessStore } from "@/store";
import { ProcessStore } from "@/store/process/types";
import { defer } from "@v1nt1248/3nclient-lib/utils";
import { installApp } from "./app-operations";
import { updateAppsAndLaunchersInfoInStore } from "./updateAppsAndLaunchersInfoInStore";
import { debouncedFnCall } from "@/utils";

/**
 * This "controller" function installs given bundled app version.
 * Respective stores are updated, and global events are emitted.
 * @param appId
 * @param version
 */
export const installBundledApp = debouncedFnCall(async (
  appId: string, version: string
) => {
  try {
    const procsStore = useProcessStore();

    await unpackBundledApp(appId, procsStore);

    await installApp(appId, version, procsStore);

  } catch (err) {
    w3n.log('error', `Failed to install app ${appId} version ${version}`);
  } finally {
    await updateAppsAndLaunchersInfoInStore();
  }
}, (appId: string) => appId);

async function unpackBundledApp(
  appId: string, procsStore: ProcessStore
): Promise<void> {
  const deferred = defer<void>();
  procsStore.upsertProcess(appId, {
    procType: 'unzipping', progressValue: 0
  });
  w3n.system!.apps!.installer!.unpackBundledApp(appId, {
    next: ev => {
      const { numOfFiles, numOfProcessed } = ev;
      const progressValue = Math.floor(numOfProcessed/numOfFiles*100);
      procsStore.upsertProcess(appId, {
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
    procsStore.delProcess(appId, 'unzipping');
  }
}
