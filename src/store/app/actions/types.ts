/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import type { PiniaActionTree } from '@v1nt1248/3nclient-lib/plugins';
import type { AppStore } from '../types';
import type { AvailableColorTheme, AvailableLanguage } from '@/types';
import { AppConfigsInternal, SettingsJSON } from '@/services/ui-settings';

export type Actions = {
  getConnectivityStatus(): Promise<void>;
  getUser(): Promise<void>;
  setLang(lang: AvailableLanguage): void;
  setColorTheme(theme: AvailableColorTheme): void;
  getAppConfig(): Promise<AppConfigsInternal | undefined>;
  updateAppConfig(appConfig: Partial<SettingsJSON>): Promise<void>;
  prepareAppListForInstallAndUpdate(): Promise<void>;
};

export type AppActions = PiniaActionTree<Actions, AppStore>;
