/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import type { AppActions } from '@/store/app/actions/types';
import { type SettingsJSON, UISettings } from '@/services/ui-settings';

export const updateAppConfig: AppActions['updateAppConfig'] = async function (appConfig: Partial<SettingsJSON>) {
  const config = await UISettings.makeInternalService();
  const updatedAppConfig = {
    lang: this.lang,
    colorTheme: this.colorTheme,
    ...appConfig,
  };
  try {
    await config.saveSettingsFile({
      currentConfig: updatedAppConfig,
    });

    if (updatedAppConfig.lang !== this.lang) {
      this.setLang(updatedAppConfig.lang);
    }
    if (updatedAppConfig.colorTheme !== this.colorTheme) {
      this.setColorTheme(updatedAppConfig.colorTheme);
    }

    this.$createNotice({
      type: 'success',
      content: this.$i18n.tr('app.settings.save.success'),
    });
  } catch (e) {
    console.error('The apps settings save error: ', e);
    this.$createNotice({
      type: 'error',
      content: this.$i18n.tr('app.settings.save.error'),
    });
  }
};
