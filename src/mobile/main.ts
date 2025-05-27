/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Vue3TouchEvents, { type Vue3TouchEventsOptions } from 'vue3-touch-events';
import {
  i18n,
  I18nOptions,
  notifications,
  vueBus,
  storeI18n,
  storeNotifications,
} from '@v1nt1248/3nclient-lib/plugins';

import '@v1nt1248/3nclient-lib/variables.css';
import '@v1nt1248/3nclient-lib/style.css';
import '@/common/assets/styles/main.css';

import { piniaRouter } from '@/common/plugins/pinia-router';
import { router } from './router';

import en from '@/common/data/i18/en.json';

import App from '@/mobile/pages/app/app.vue';

// const mode = process.env.NODE_ENV;

function init() {
  const pinia = createPinia();
  pinia.use(piniaRouter);
  pinia.use(storeI18n);
  pinia.use(storeNotifications);

  const app = createApp(App);

  app.config.compilerOptions.isCustomElement = tag => {
    return tag.startsWith('ui3n-');
  };

  app
    .use(pinia)
    .use<Vue3TouchEventsOptions>(Vue3TouchEvents, { disableClick: false })
    .use<I18nOptions>(i18n, { lang: 'en', messages: { en } })
    .use(vueBus)
    .use(notifications)
    .use(router)
    .mount('#mobile');
}

init();
