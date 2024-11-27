/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { deepEqual } from "@/lib-common/json-utils";
import { MAIN_GUI_ENTRYPOINT, getDynamicLaunchersLocations, getLaunchersForUser } from "@/lib-common/manifest-utils";
import { WeakCache } from "@/lib-common/weak-cache";
import { AppInfo } from "@/types";
import { NamedProcs, SingleProc } from "@v1nt1248/3nclient-lib/utils";
import { compare as compareSemVer } from 'semver';

type AppVersions = web3n.system.apps.AppVersions;
type WritableFS = web3n.files.WritableFS;
type FileException = web3n.files.FileException;
type Launcher = web3n.caps.Launcher;
type AppManifest = web3n.caps.AppManifest;
type DynamicLaunchers = web3n.caps.DynamicLaunchers;

interface CachedAppVersions {
  formatVer: 1;
  stateTS: number;
  appVersions: AppVersions[];
  apps: {
    [appId: string]: AppInfo;
  };
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
  private apps: CachedAppVersions['apps'] = {};
  private fs: WritableFS|undefined = undefined;
  private readonly refreshProc = new SingleProc();

  constructor() {
    Object.seal(this);
  }

  init(): Promise<void> {
    return this.refreshProc.start(async () => {
      this.fs = await w3n.storage!.getAppLocalFS!();
      try {
        const {
          formatVer, stateTS, appVersions, launchers, apps
        } = await this.fs.readJSONFile<CachedAppVersions>(appVersionsPath);
        if (formatVer === 1) {
          this.stateTS = stateTS;
          this.appVersions = appVersions;
          this.launchers = launchers;
          this.apps = apps;
        } else {
          await this.unsyncedAppVersionsRefresh();
        }
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
    if (deepEqual(lst, this.appVersions)) {
      return this.stateTS;
    }

    const { addedOrChanged, removed } = diffAppVersions(lst, this.appVersions);
    this.appVersions = lst;
    this.stateTS = Date.now();

    // remove removed apps
    for (const id of removed) {
      delete this.apps[id];
      delete this.launchers[id];
    }

    // create new values for added or changed apps
    for (const id of addedOrChanged) {
      const info = await getAppInfo(
        id, this.appVersions.find(verInfo => (verInfo.id === id))!
      );
      if (info) {
        const { appInfo, currentManif } = info;
        this.apps[id] = appInfo;
        const appLaunchers = await getAppLaunchers(id, currentManif);
        if (appLaunchers) {
          this.launchers[id] = appLaunchers;
        } else {
          delete this.launchers[id];
        }
      } else {
        delete this.apps[id];
        delete this.launchers[id];
      }
    }

    await this.fs!.writeJSONFile(appVersionsPath, {
      appVersions: this.appVersions,
      stateTS: this.stateTS,
      launchers: this.launchers,
      apps: this.apps
    } as CachedAppVersions);

    return this.stateTS;
  }

  async getAppsInfoAndLaunchers(
    refreshCache?: true
  ): Promise<{
    cacheTS: number; launchers: CachedAppLaunchers[]; apps: AppInfo[];
  }> {
    const refreshProc = this.refreshProc.getP();
    if (refreshProc) {
      await refreshProc;
    } else if (refreshCache) {
      await this.refreshProc.addStarted(this.unsyncedAppVersionsRefresh());
    }
    return {
      cacheTS: this.stateTS,
      apps: Object.values(this.apps).concat(),
      launchers: Object.values(this.launchers).concat()
    };
  }

  async hasAppPacks(): Promise<boolean> {
    await this.refreshProc.getP();
    const foundAppWithPacks = !!this.appVersions.find(
      ({ packs }) => (Array.isArray(packs) && (packs.length > 0))
    );
    return foundAppWithPacks;
  }

  async getAppsInfo(): Promise<{
    cacheTS: number; apps: AppInfo[];
  }> {
    await this.refreshProc.getP();
    return {
      cacheTS: this.stateTS,
      apps: Object.values(this.apps).concat()
    };
  }

}

function diffAppVersions(
  newApps: AppVersions[], prevApps: AppVersions[]
): {
  addedOrChanged: Set<string>, removed: Set<string>
} {
  const addedOrChanged = new Set<string>();
  const same = new Set<string>();
  const removed = new Set<string>();
  for (const app of newApps) {
    const prevApp = prevApps.find(({ id }) => (app.id === id));
    if (!prevApp || !deepEqual(app, prevApp)) {
      addedOrChanged.add(app.id);
    } else {
      same.add(app.id);
    }
  }
  for (const { id } of prevApps) {
    if (!same.has(id) && !addedOrChanged.has(id)) {
      removed.add(id);
    }
  }
  return { addedOrChanged, removed };
}

async function getAppInfo(
  id: string, { current, packs }: AppVersions
): Promise<{ appInfo: AppInfo; currentManif?: AppManifest; }|undefined> {
  const latest = latestVersionOf(current, packs);
  if (!latest) {
    return;
  }

  const m = await w3n.system!.apps!.opener!.getAppManifest(id, latest);
  if (!m) { return; }
  if (m.appDomain !== id) {
    w3n.log('error', `Application with id ${id} has manifest with a different app domain field ${m.appDomain}`);
    return;
  }

  const appId = m.appDomain;
  const { name, description, icon } = m;
  const appInfo: AppInfo = {
    appId, name, description, icon,
    versions: {
      latest, current, packs
    }
  };

  return { appInfo, currentManif: ((m.version === current) ? m : undefined) };
}

function latestVersionOf(
  current: string|undefined,
  packs: string[]|undefined
): string|undefined {
  const all = (packs ? packs.concat() : []);
  if (current) {
    all.push(current);
  }
  if (all.length === 0) {
    return;
  } else if (all.length === 1) {
    return all[0];
  } else {
    return all.reduce((v1, v2) => (
      (compareSemVer(v1, v2) === 1) ? v1 : v2
    ));
  }
}

async function getAppLaunchers(
  id: string, m: AppManifest|undefined
): Promise<CachedAppLaunchers|undefined> {
  if (!m) {
    m = await w3n.system!.apps!.opener!.getAppManifest(id);
  }
  if (!m) { return; }
  if (m.appDomain !== id) {
    w3n.log('error', `Application with id ${id} has manifest with a different app domain field ${m.appDomain}`);
    return;
  }

  const appId = m.appDomain;
  const { version, name, description, icon } = m;

  let staticLaunchers = getLaunchersForUser(m);
  const dynLaunchers = getDynamicLaunchersLocations(m);
  if (!staticLaunchers && !dynLaunchers) {
    return;
  }

  let defaultLauncher: CachedAppLaunchers['defaultLauncher'] = undefined;
  if (staticLaunchers) {
    let indOfDefault = staticLaunchers.findIndex(
      l => (l.component === MAIN_GUI_ENTRYPOINT)
    );
    if (indOfDefault < 0) {
      indOfDefault = 0;
    }
    defaultLauncher = staticLaunchers[indOfDefault];
    if (staticLaunchers.length = 1) {
      staticLaunchers = undefined;
    } else {
      staticLaunchers.splice(indOfDefault, 1);
    }
  }
  const appLaunchers: CachedAppLaunchers = {
    appId, version, name, icon, description,
    defaultLauncher, staticLaunchers, dynLaunchers
  };
  return appLaunchers;
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
