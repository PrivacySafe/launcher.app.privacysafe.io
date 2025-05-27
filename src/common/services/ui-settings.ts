/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import type { AppConfig, AvailableLanguage, AvailableColorTheme } from '@/common/types';
import { SingleProc } from '@v1nt1248/3nclient-lib/utils';

export interface AppConfigsInternal {
  getSettingsFile: () => Promise<AppSettings>;
  saveSettingsFile: (data: AppSettings) => Promise<void>;
  getCurrentLanguage: () => Promise<AvailableLanguage>;
  getCurrentColorTheme: () => Promise<AvailableColorTheme>;
}

export interface AppConfigs {
  getCurrentLanguage: () => Promise<AvailableLanguage>;
  getCurrentColorTheme: () => Promise<AvailableColorTheme>;
  watchConfig(obs: web3n.Observer<AppConfig>): () => void;
}

export interface SettingsJSON {
  lang: AvailableLanguage;
  colorTheme: AvailableColorTheme;
}

export interface AppSettings {
  currentConfig: SettingsJSON;
}

const resourceName = 'ui-settings';
const resourceApp = 'launcher.app.privacysafe.io';
const settingsPath = '/constants/settings.json';

export class SystemSettings implements AppConfigs, AppConfigsInternal {
  private syncProc: SingleProc | undefined = undefined;

  private constructor(private readonly file: web3n.files.File) {}

  static async makeInternalService(): Promise<AppConfigsInternal> {
    // this implicitly initializes resource, and will fail if it isn't launcher
    await w3n.shell!.getFSResource!(undefined, resourceName);
    const localStore = await w3n.storage!.getAppLocalFS!();
    const file = await localStore.writableFile(settingsPath);
    if (file.isNew) {
      const defaultSettings = await (await fetch(settingsPath)).json();
      await file.writeJSON(defaultSettings);
    }
    return new SystemSettings(file);
  }

  static async makeResourceReader(): Promise<AppConfigs> {
    const file = await w3n.shell!.getFSResource!(resourceApp, resourceName);
    return new SystemSettings(file as web3n.files.ReadonlyFile);
  }

  private get writableFile(): {
    file: web3n.files.WritableFile;
    syncProc: SingleProc;
  } {
    if (this.file.writable) {
      if (!this.syncProc) {
        this.syncProc = new SingleProc();
      }
      return {
        file: this.file as web3n.files.WritableFile,
        syncProc: this.syncProc,
      };
    } else {
      throw Error(`This instance can only read ${resourceName} file resource provided by ${resourceApp}`);
    }
  }

  async getSettingsFile(): Promise<AppSettings> {
    const currentConfig = await this.file.readJSON<SettingsJSON>();
    return { currentConfig };
  }

  async saveSettingsFile(data: AppSettings): Promise<void> {
    const settingsJSON = data.currentConfig as SettingsJSON;
    const { file, syncProc } = this.writableFile;
    await syncProc.startOrChain(() => file.writeJSON(settingsJSON));
  }

  async getCurrentLanguage(): Promise<AvailableLanguage> {
    const { lang } = await this.file.readJSON<SettingsJSON>();
    return lang;
  }

  async getCurrentColorTheme(): Promise<AvailableColorTheme> {
    const { colorTheme } = await this.file.readJSON<SettingsJSON>();
    return colorTheme;
  }

  watchConfig(obs: web3n.Observer<AppConfig>): () => void {
    return this.file.watch({
      next: obs.next
        ? async event => {
            if (event.type === 'file-change') {
              const lang = await this.getCurrentLanguage();
              const colorTheme = await this.getCurrentColorTheme();
              obs.next!({ lang, colorTheme });
            }
          }
        : undefined,
      complete: obs.complete ? () => obs.complete!() : undefined,
      error: err => (obs.error ? obs.error!(err) : undefined),
    });
  }
}
