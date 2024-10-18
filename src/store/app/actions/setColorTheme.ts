/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import type { AppActions } from '@/store/app/actions/types';
import type { AvailableColorTheme } from '@/types';

export const setColorTheme: AppActions['setColorTheme'] = function (this, theme: AvailableColorTheme) {
  this.colorTheme = theme;
  const htmlEl = document.querySelector('html');
  if (!htmlEl) return;

  const prevColorThemeCssClass = theme === 'default' ? 'dark-theme' : 'default-theme';
  const curColorThemeCssClass = theme === 'default' ? 'default-theme' : 'dark-theme';
  htmlEl.classList.remove(prevColorThemeCssClass);
  htmlEl.classList.add(curColorThemeCssClass);
};
