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
