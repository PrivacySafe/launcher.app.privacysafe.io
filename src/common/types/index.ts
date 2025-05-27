/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

type AppVersions = web3n.system.apps.AppVersions;

export interface AppInfo {
  readonly appId: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  iconBytes?: Uint8Array;
  readonly versions: {
    latest: string;
    current: AppVersions['current'],
    bundled?: string,
    packs: AppVersions['packs'],
    afterRestart?: string;
  };
  updates?: ChannelVersion[];
  updateFromBundle?: string;
}

export interface ChannelVersion {
  channel: string;
  version: string;
}

export interface Launcher extends web3n.caps.Launcher {
  iconBytes?: Uint8Array;
}

export interface AppLaunchers {
  appId: string;
  version: string;
  name: string;
  description: string;
  icon: string;
  iconBytes?: Uint8Array;
  defaultLauncher?: Launcher;
  staticLaunchers: Launcher[];
  dynamicLaunchers: Launcher[];
}

export type AvailableLanguage = 'en';

export type AvailableColorTheme = 'default' | 'dark';

export type AppConfig = {
  lang: AvailableLanguage;
  colorTheme: AvailableColorTheme;
};

export type ConnectivityStatus = 'offline' | 'online';

export interface GlobalEvents {
  "init-setup:start": {
    bundledAppsForInstall: string[];
  };
  "init-setup:done": null;
  "platform:restart-to-update": null;
}

export interface AppEventData {
  appId: string|null;
  version: string;
}
