/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { deepEqual } from "@/lib-common/json-utils";
import { MAIN_GUI_ENTRYPOINT, getDynamicLaunchersLocations, getLaunchersForUser } from "@/lib-common/manifest-utils";
import { WeakCache } from "@/lib-common/weak-cache";
import { NamedProcs, SingleProc } from "@v1nt1248/3nclient-lib/utils";

type AppVersions = web3n.system.apps.AppVersions;
type WritableFS = web3n.files.WritableFS;
type FileException = web3n.files.FileException;
type Launcher = web3n.caps.Launcher;
type DynamicLaunchers = web3n.caps.DynamicLaunchers;

interface CachedAppVersions {
  stateTS: number;
  appVersions: AppVersions[];
  launchers: {
    [appId: string]: CachedAppLaunchers;
  };
}

export interface CachedAppLaunchers {
  appId: string;
  version: string;
  name: string;
  icon: string;
  description: string;
  defaultLauncher?: Launcher;
  staticLaunchers?: Launcher[];
  dynLaunchers?: DynamicLaunchers[];
}

const appVersionsPath = '/cached/app-versions.json';

export class CachedSystemInfo {

  private stateTS = 0;
  private appVersions: AppVersions[] = [];
  private launchers: CachedAppVersions['launchers'] = {};
  private fs: WritableFS|undefined = undefined;
  private readonly proc = new SingleProc();

  constructor() {
    Object.seal(this);
  }

  init(): Promise<void> {
    return this.proc.start(async () => {
      this.fs = await w3n.storage!.getAppLocalFS!();
      try {
        const {
          stateTS, appVersions, launchers
        } = await this.fs.readJSONFile<CachedAppVersions>(appVersionsPath);
        this.stateTS = stateTS;
        this.appVersions = appVersions;
        this.launchers = launchers;
      } catch (exc) {
        if (!(exc as FileException).notFound) {
          throw exc;
        }
        await this.unsyncedAppVersionsRefresh();
      }
    });
  }

  private async unsyncedAppVersionsRefresh(): Promise<number> {
    const lst = await w3n.system!.apps!.opener!.listApps();
    if (deepEqual(this.appVersions, lst)) {
      return this.stateTS;
    }
    this.appVersions = lst;
    this.stateTS = Date.now();
    const { remove, update } = findDifferences(
      this.appVersions, this.launchers
    );
    for (const id of remove) {
      delete this.launchers[id];
    }
    for (const id of update) {
      const appLaunchers = await getLaunchers(id);
      if (appLaunchers) {
        this.launchers[id] = appLaunchers;
      } else {
        delete this.launchers[id];
      }
    }
    await this.fs!.writeJSONFile(appVersionsPath, {
      appVersions: this.appVersions,
      stateTS: this.stateTS,
      launchers: this.launchers
    } as CachedAppVersions);
    return this.stateTS;
  }

  async refreshAppVersions(): Promise<number> {
    return this.proc.startOrChain(() => this.unsyncedAppVersionsRefresh());
  }

  async getAppLaunchers(): Promise<{
    cacheTS: number; launchers: CachedAppLaunchers[];
  }> {
    await this.proc.getP();
    return {
      cacheTS: this.stateTS,
      launchers: Object.values(this.launchers).concat()
    };
  }

}

function findDifferences(
  appVersions: CachedSystemInfo['appVersions'],
  launchers: CachedAppVersions['launchers']
): { remove: string[]; update: string[]; } {
  const remove: string[] = [];
  const update: string[] = [];
  const currentVersions: { [id: string]: string; } = {};
  for (const { id, current } of appVersions) {
    if (current) {
      currentVersions[id] = current;
    }
  }
  for (const id of Object.keys(launchers)) {
    if (!currentVersions[id]) {
      remove.push(id);
    }
  }
  for (const [ id, version ] of Object.entries(currentVersions)) {
    const launcher = launchers[id];
    if (!launcher || (launcher.version === version)) {
      update.push(id);
    }
  }
  return { remove, update };
}

async function getLaunchers(id: string): Promise<CachedAppLaunchers|undefined> {
  const m = await w3n.system!.apps!.opener!.getAppManifest(id);
  if (!m) { return; }
  const appId = m.appDomain;
  const { version, name, description, icon } = m;
  let staticLaunchers = getLaunchersForUser(m);
  const dynLaunchers = getDynamicLaunchersLocations(m);
  if (!staticLaunchers && !dynLaunchers) { return; }
  let defaultLauncher: CachedAppLaunchers['defaultLauncher'] = undefined;
  if (staticLaunchers) {
    const indOfDefault = staticLaunchers.findIndex(
      l => (l.component === MAIN_GUI_ENTRYPOINT)
    );
    if (indOfDefault >= 0) {
      defaultLauncher = staticLaunchers[indOfDefault];
      if (staticLaunchers.length = 1) {
        staticLaunchers = undefined;
      } else {
        staticLaunchers.splice(indOfDefault, 1);
      }
    }
  }
  return {
    appId, version, name, icon, description,
    defaultLauncher, staticLaunchers, dynLaunchers
  };
}

export class CachedAppFiles {

  private cache = new WeakCache<string, Uint8Array>();
  private readonly procs = new NamedProcs();

  async getFileBytes(
    appId: string, version: string, path: string
  ): Promise<Uint8Array|undefined> {
    const key = this.keyFor(appId, version, path);
    let fileBytes = this.cache.get(key);
    if (fileBytes) {
      return fileBytes;
    }
    const proc = this.procs.getP<Uint8Array|undefined>(key);
    if (proc) {
      return proc;
    }
    return this.procs.start(key, async () => {
      const fileBytes = await w3n.system!.apps!.opener!.getAppFileBytes(
        appId, path, version
      );
      if (fileBytes) {
        this.cache.set(key, fileBytes);
      }
      return fileBytes;
    });
  }

  private keyFor(appId: string, version: string, path: string): string {
    return `${appId}-${version}-${path}`;
  }

}
