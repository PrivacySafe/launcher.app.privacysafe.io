/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { UPDATE_INFO_CACHE_TTL_SECONDS } from '@/common/constants';
import { NamedProcs } from '@v1nt1248/3nclient-lib/utils';

type WritableFS = web3n.files.WritableFS;
type FileException = web3n.files.FileException;
type DistChannels = web3n.system.apps.DistChannels;
type BundleVersions = web3n.system.platform.BundleVersions;

export interface ChannelsInfo {
  channels: DistChannels['channels'];
  mainChannel: DistChannels['main'];
}

export interface CachedAppDistributionInfo extends ChannelsInfo {
  appId: string;
  cacheTS: number;
  versions: {
    [channel: string]: string;
  };
}

export interface CachedBundleDistributionInfo extends ChannelsInfo {
  cacheTS: number;
  versions: {
    [channel: string]: BundleVersions;
  };
}

const UPDATES_CACHE_DIR = '/cached/apps-dist-info';
const UPDATE_INFO_FILE = 'bundle';

export class AppDistInfoChecker {
  private fs: WritableFS | undefined = undefined;
  private readonly procSync = new NamedProcs();
  private initProc: Promise<void> | undefined = undefined;

  constructor() {
    Object.seal(this);
  }

  init(): Promise<void> {
    this.initProc = w3n.storage!.getAppLocalFS!()
      .then(appFS => appFS.writableSubRoot(UPDATES_CACHE_DIR))
      .then(fs => {
        this.fs = fs;
        this.initProc = undefined;
      });
    return this.initProc;
  }

  private async getCachedData<T>(fName: string): Promise<T | undefined> {
    await this.initProc;
    try {
      return await this.fs!.readJSONFile<T>(fName);
    } catch (exc) {
      if ((exc as FileException).notFound) {
        return;
      } else {
        throw exc;
      }
    }
  }

  private async saveData<T>(fName: string, data: T): Promise<void> {
    await this.initProc;
    await this.fs!.writeJSONFile(fName, data);
  }

  private getCachedAppData(appId: string): Promise<CachedAppDistributionInfo | undefined> {
    return this.getCachedData(appId);
  }

  private async saveAppData(data: CachedAppDistributionInfo): Promise<void> {
    await this.saveData(data.appId, data);
  }

  async getAppDistInfo(appId: string, forceInfoDownload = false): Promise<CachedAppDistributionInfo | undefined> {
    const cachedInfo = await this.getCachedAppData(appId);
    if (!forceInfoDownload && cachedInfo && cacheIsRecent(cachedInfo.cacheTS, Date.now())) {
      return cachedInfo;
    }
    return this.procSync
      .startOrChain(appId, async () => {
        const data = await downloadAppData(appId);
        await this.saveAppData(data);
        return data;
      })
      .catch(err => {
        w3n.log('info', `Fail to check app ${appId} updates information`, err);
        return cachedInfo;
      });
  }

  private getCachedBundleData(): Promise<CachedBundleDistributionInfo | undefined> {
    return this.getCachedData(UPDATE_INFO_FILE);
  }

  private async saveBundleData(data: CachedBundleDistributionInfo): Promise<void> {
    await this.saveData(UPDATE_INFO_FILE, data);
  }

  async getBundleDistInfo(forceInfoDownload = false): Promise<CachedBundleDistributionInfo | undefined> {
    const cachedInfo = await this.getCachedBundleData();
    if (!forceInfoDownload && cachedInfo && cacheIsRecent(cachedInfo.cacheTS, Date.now())) {
      return cachedInfo;
    }
    return this.procSync
      .startOrChain(UPDATE_INFO_FILE, async () => {
        const data = await downloadBundleData();
        await this.saveBundleData(data);
        return data;
      })
      .catch(err => {
        w3n.log('info', `Fail to check platform updates information`, err);
        return cachedInfo;
      });
  }
}

async function downloadAppData(appId: string): Promise<CachedAppDistributionInfo> {
  const downloader = w3n.system!.apps!.downloader!;
  const data = {
    appId,
    versions: {},
    cacheTS: Date.now(),
  } as CachedAppDistributionInfo;
  const { channels, main } = await downloader.getAppChannels(appId);
  data.channels = channels;
  data.mainChannel = main;
  for (const channel of Object.keys(channels)) {
    try {
      const version = await downloader.getLatestAppVersion(appId, channel);
      data.versions[channel] = version;
    } catch (err) {
      w3n.log('info', `Fail to get latest version of app ${appId} in channel ${channel}`, err);
    }
  }
  return data;
}

function cacheIsRecent(cacheTS: number, now: number): boolean {
  return cacheTS + UPDATE_INFO_CACHE_TTL_SECONDS * 1000 > now;
}

async function downloadBundleData(): Promise<CachedBundleDistributionInfo> {
  const downloader = w3n.system!.platform!;
  const data = {
    versions: {},
    cacheTS: Date.now(),
  } as CachedBundleDistributionInfo;
  const { channels, main } = await downloader.getChannels();
  data.channels = channels;
  data.mainChannel = main;
  for (const channel of Object.keys(channels)) {
    try {
      const bundleVerInfo = await downloader.getLatestVersion(channel);
      data.versions[channel] = bundleVerInfo;
    } catch (err) {
      w3n.log('info', `Fail to get latest version of platform in channel ${channel}`, err);
    }
  }
  return data;
}
