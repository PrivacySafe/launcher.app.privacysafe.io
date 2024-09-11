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

import App from '@/views/app/app.vue';

import '@v1nt1248/3nclient-lib/style.css';
import '@v1nt1248/3nclient-lib/variables.css';
import '@/assets/styles/main.css';

import en from './data/i18/en.json';

const mode = process.env.NODE_ENV;

function init() {
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
