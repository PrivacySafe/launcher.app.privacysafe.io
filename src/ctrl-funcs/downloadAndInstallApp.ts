/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { installApp, downloadApp } from "./app-operations";
import { ProcessStore } from "@/store/process/types";
import { AppInfo } from "@/types";
import { debouncedFnCall } from "@/utils";

type PostInstallState = web3n.system.apps.PostInstallState;

/**
 * This "controller" function downloads and installs given app version.
 * Respective stores are updated, and global events are emitted.
 * @param app
 * @param version
 * @param procsStore
 */
export const downloadAndInstallApp = debouncedFnCall(async (
  app: AppInfo, version: string, procsStore: ProcessStore
): Promise<PostInstallState|undefined> => {
  try {

    if (!app.versions.packs
    || !app.versions.packs.includes(version)) {
      await downloadApp(app.appId, version, procsStore);
    }

    return await installApp(app.appId, version, procsStore);

  } catch (err) {
    w3n.log('error', `Failed to download and install app ${app.appId} version ${version}`);
  }
});
