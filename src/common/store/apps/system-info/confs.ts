/*
 Copyright (C) 2025 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

type WritableFS = web3n.files.WritableFS;
type FileException = web3n.files.FileException;

import { SingleProc } from "@v1nt1248/3nclient-lib/utils";

interface SavedConfs {
  formatVer: 1;
  autoUpdate: boolean;
}

const confsPath = 'confs.json';

export class Confs {

  private data: SavedConfs = {
    formatVer: 1,
    autoUpdate: true
  };
  private fs: WritableFS | undefined = undefined;
  private readonly refreshProc = new SingleProc();

  constructor() {
    Object.seal(this);
  }

  init(): Promise<void> {
    return this.refreshProc.start(async () => {
      this.fs = await w3n.storage!.getAppSyncedFS!();
      try {
        const {
          formatVer, autoUpdate
        } = await this.fs.readJSONFile<SavedConfs>(confsPath);
        if (formatVer === 1) {
          this.data.autoUpdate = autoUpdate;
        } else {
        await this.fs!.writeJSONFile(confsPath, this.data);
        }
      } catch (exc) {
        if (!(exc as FileException).notFound) {
          throw exc;
        }
        await this.fs!.writeJSONFile(confsPath, this.data);
      }
    });
  }

  async getAutoUpdate(): Promise<SavedConfs['autoUpdate']> {
    await this.refreshProc.getP();
    return this.data.autoUpdate;
  }

  async setAutoUpdate(value: boolean): Promise<void> {
    await this.refreshProc.startOrChain(async () => {
      if (this.data.autoUpdate !== value) {
        this.data.autoUpdate = value;
        await this.fs!.writeJSONFile(confsPath, this.data);
      }
    });
  }

}
