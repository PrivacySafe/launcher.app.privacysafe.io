import type { AppActions } from '@/store/app/actions/types';

export const setLang: AppActions['setLang'] = function (this, lang) {
  this.lang = lang;
};
