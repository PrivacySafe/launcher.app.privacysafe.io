/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { userSystem } from '@/common/services';
import { AppInfo, ChannelVersion } from '@/common/types';
import { compare as compareSemVer } from 'semver';
import { ProcessesPlace } from './processes';
import { AppsStore } from '../apps.store';

type BundleVersions = web3n.system.platform.BundleVersions;

export async function checkAppUpdates(
  app: AppInfo,
  forceInfoDownload: boolean,
  delProcess: ProcessesPlace['delProcess'],
  upsertProcess: ProcessesPlace['upsertProcess'],
): Promise<void> {
  const {
    appId,
    versions: { latest: current },
  } = app;
  upsertProcess(appId, {
    procType: 'update-checking',
  });
  try {
    const distInfo = await userSystem.getAppDistInfo(appId, forceInfoDownload);
    if (!distInfo) {
      app.updates = undefined;
      return;
    }

    const updateOpts: NonNullable<AppInfo['updates']> = [];
    for (const [channel, version] of Object.entries(distInfo.versions)) {
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
    delProcess(appId, 'update-checking');
  }
}

export async function checkPlatformUpdates(
  platform: AppsStore['platform'],
  forceInfoDownload: boolean,
  delProcess: ProcessesPlace['delProcess'],
  upsertProcess: ProcessesPlace['upsertProcess'],
): Promise<void> {
  upsertProcess(null, {
    procType: 'update-checking',
  });
  try {
    const distInfo = await userSystem.getBundleDistInfo(forceInfoDownload);
    if (!distInfo) {
      return;
    }

    const currentVer = await w3n.system!.platform!.getCurrentVersion();
    const updateOpts: ChannelVersion[] = [];
    for (const [channel, latestChannelVer] of Object.entries(distInfo.versions)) {
      if (canUpdateBundle(currentVer, latestChannelVer)) {
        updateOpts.push({ channel, version: latestChannelVer.bundle });
      }
    }
    if (updateOpts.length > 0) {
      platform.availableUpdates = updateOpts;
    }
  } finally {
    delProcess(null, 'update-checking');
  }
}

function canUpdateBundle(current: BundleVersions, latestAvailable: BundleVersions): boolean {
  const platDiff = compareSemVer(current.platform, latestAvailable.platform);
  if (platDiff < 0) {
    return true;
  } else if (platDiff > 0) {
    return false;
  }

  const currBundleNum = parseInt(current.bundle.substring(current.bundle.indexOf('+') + 1));
  const latestBundleNum = parseInt(latestAvailable.bundle.substring(latestAvailable.bundle.indexOf('+') + 1));
  if (currBundleNum >= latestBundleNum) {
    return false;
  }

  for (const [appId, version] of Object.entries(latestAvailable.apps)) {
    const currVer = current.apps[appId];
    if (currVer === undefined || compareSemVer(currVer, version) < 0) {
      return true;
    }
  }

  return false;
}
