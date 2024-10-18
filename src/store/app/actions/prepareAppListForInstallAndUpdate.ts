/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import type { AppActions } from '@/store/app/actions/types';
import type { AppView, AppViewManifest } from '@/types';

export const prepareAppListForInstallAndUpdate: AppActions['prepareAppListForInstallAndUpdate'] = async function (
  this,
) {
  const data: Record<string, AppView> = {};
  for (const appId of this.applicationsIdsForInstallAndUpdate) {
    const version = await w3n.system!.apps!.downloader!.getLatestAppVersion(
      appId, 'nightly'
    );
    const manifest = (await w3n.system!.apps!.opener!.getAppManifest(
      appId, version
    )) as AppViewManifest;
    if (
      manifest?.launchOnSystemStartup &&
      manifest?.launchOnSystemStartup[0] &&
      manifest.launchOnSystemStartup[0].icon
    ) {
      const file = await w3n.system!.apps!.opener!.getAppFileBytes(
        appId, manifest.launchOnSystemStartup[0].icon, version
      );
      manifest.launchOnSystemStartup[0].iconFile = file;
    }

    data[appId] = {
      id: appId,
      current: version,
      manifest,
    };
  }

  this.applicationsForInstallAndUpdate = Object.values(data);
};
