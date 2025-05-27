/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import type { AvailableColorTheme, AvailableLanguage } from '@/common/types';

export const AVAILABLE_THEMES: Record<AvailableColorTheme, { label: string; cssClass: string }> = {
  default: {
    label: 'settings.theme.light',
    cssClass: 'default-theme',
  },
  dark: {
    label: 'settings.theme.dark',
    cssClass: 'dark-theme',
  },
};

export const AVAILABLE_LANGS: Record<AvailableLanguage, { value: AvailableLanguage; label: string }> = {
  en: { value: 'en', label: 'English' },
};

export const UPDATE_INFO_CACHE_TTL_SECONDS = 12 * 60 * 60;
