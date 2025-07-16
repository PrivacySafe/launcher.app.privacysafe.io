/*
 Copyright (C) 2024 - 2025 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { App } from 'vue';
import { createPinia } from 'pinia';
import {
  i18n,
  I18nOptions,
  notifications,
  vueBus,
  storeI18n,
  storeNotifications,
} from '@v1nt1248/3nclient-lib/plugins';

import { piniaRouter } from '@/common/plugins/pinia-router';
import en from '@/common/data/i18/en.json';
import { Router } from 'vue-router';

export function setupApp(
  app: App<Element>, router: Router|undefined
) {

  const pinia = createPinia();
  pinia.use(storeI18n);
  pinia.use(storeNotifications);
  if (router) {
    pinia.use(piniaRouter);
  }

  app.config.compilerOptions.isCustomElement = tag => {
    return tag.startsWith('ui3n-');
  };

  app
  .use(pinia)
  .use(vueBus)
  .use<I18nOptions>(i18n, { lang: 'en', messages: { en } })
  .use(notifications);
  if (router) {
    app.use(router);
  }

}

