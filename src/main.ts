/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import {
  dialogs,
  i18n,
  I18nOptions,
  notifications,
  vueBus,
  storeI18n,
  storeNotifications,
} from '@v1nt1248/3nclient-lib/plugins';

import '@v1nt1248/3nclient-lib/variables.css';
import '@v1nt1248/3nclient-lib/style.css';
import '@/assets/styles/main.css';

import en from './data/i18/en.json';

import App from '@/views/app/app.vue';
import { initServices } from './services';

const mode = process.env.NODE_ENV;

function init() {
  initServices();

  const pinia = createPinia();
  pinia.use(storeI18n);
  pinia.use(storeNotifications);

  const app = createApp(App);

  app.config.compilerOptions.isCustomElement = tag => {
    return tag.startsWith('ui3n-');
  };

  app
    .use(pinia)
    .use(vueBus)
    .use<I18nOptions>(i18n, { lang: 'en', messages: { en } })
    .use(dialogs)
    .use(notifications)
    .mount('#main');
}

if ((w3n as web3n.testing.CommonW3N).testStand && mode !== 'production') {
  import('@vue/devtools').then(devtools => {
    (w3n as web3n.testing.CommonW3N).testStand.staticTestInfo().then((data: { userNum: number; userId: string }) => {
      const { userNum } = data;
      devtools.devtools.connect('http://localhost', 8097 + userNum);
      init();
    });
  });
} else if (mode !== 'production') {
  import('@vue/devtools').then(devtools => {
    devtools.devtools.connect('http://localhost', 8098);
    init();
  });
} else {
  init();
}

// init();
