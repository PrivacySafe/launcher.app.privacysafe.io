/*
 Copyright (C) 2024 - 2025 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { WeakCache } from '@/common/lib-common/weak-cache';
import { NamedProcs } from '@v1nt1248/3nclient-lib/utils';


export class CachedAppFiles {
  private cache = new WeakCache<string, Uint8Array>();
  private readonly procs = new NamedProcs();

  async getFileBytes(appId: string, version: string, path: string): Promise<Uint8Array | undefined> {
    const key = this.keyFor(appId, version, path);
    const fileBytes = this.cache.get(key);
    if (fileBytes) {
      return fileBytes;
    }
    const proc = this.procs.getP<Uint8Array | undefined>(key);
    if (proc) {
      return proc;
    }
    return this.procs.start(key, async () => {
      const fileBytes = await w3n.system!.apps!.installer!.getAppFileBytes(appId, path, version);
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
