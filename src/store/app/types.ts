/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import type { Store } from 'pinia';
import type { Actions } from './actions/types';
import type { AppGetters } from './getters/types';
import type { AppLaunchers, AppView, AvailableColorTheme, AvailableLanguage, ConnectivityStatus } from '@/types';

export interface AppStoreState {
  connectivityStatus: ConnectivityStatus;
  user: string;
  lang: AvailableLanguage;
  colorTheme: AvailableColorTheme;
  // installedApplications: AppView[];
  appLaunchers: AppLaunchers[];
  launchersCacheTS: number;
  applicationsForInstallAndUpdate: AppView[];
}

export type AppStore<G = AppGetters> = Store<'app', AppStoreState, G, Actions>;
