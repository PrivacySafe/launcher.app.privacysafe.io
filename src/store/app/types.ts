/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import type { Store } from 'pinia';
import type { Actions } from './actions/types';
import type { AppGetters } from './getters/types';
import type { AppLaunchers, AppInfo, AvailableColorTheme, AvailableLanguage, ConnectivityStatus, ChannelVersion } from '@/types';

type ProgressInfo = web3n.system.platform.ProgressInfo;

export interface AppStoreState {
  connectivityStatus: ConnectivityStatus;
  user: string;
  lang: AvailableLanguage;
  colorTheme: AvailableColorTheme;
  autoUpdate: boolean;
  appLaunchers: AppLaunchers[];
  cacheTS: number;
  applicationsInSystem: AppInfo[];
  platform: {
    version: string;
    bundledApps: { [appId: string]: string; };
    bundledAppPacks: { [appId: string]: string; };
    availableUpdates?: ChannelVersion[];
    updateInProcess?: {
      version: string;
      progress?: ProgressInfo;
    };
  };
  restart: null | {
    apps?: string[];
    platform?: true;
  };
}

export type AppStore<G = AppGetters> = Store<'app', AppStoreState, G, Actions>;
