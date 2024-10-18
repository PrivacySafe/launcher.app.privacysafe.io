/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { UISettings } from '@/services/ui-settings';
import type { AppActions } from '@/store/app/actions/types';

export const getAppConfig: AppActions['getAppConfig'] = async function (this) {
  try {
    const config = await UISettings.makeInternalService();
    const lang = await config.getCurrentLanguage();
    const colorTheme = await config.getCurrentColorTheme();
    this.setLang(lang);
    this.setColorTheme(colorTheme);
    return config;
  } catch (e) {
    console.error('Load the app config error: ', e);
  }
};
