import type { AvailableColorTheme, AvailableLanguage } from '@/types';

export const APP_VERSION = '0.7.4';

export const All_PRIVACYSAFE_APPLICATIONS = [
  'installer.app.privacysafe.io',
  'launcher.app.privacysafe.io',
  'contacts.app.privacysafe.io',
  'chat.app.privacysafe.io',
  'files.app.privacysafe.io',
];

export const NOT_DISPLAYED_APPLICATIONS = ['installer.app.privacysafe.io', 'launcher.app.privacysafe.io'];

export const AVAILABLE_THEMES: Record<AvailableColorTheme, { label: string; cssClass: string }> = {
  default: {
    label: 'app.color.theme.light',
    cssClass: 'default-theme',
  },
  dark: {
    label: 'app.color.theme.dark',
    cssClass: 'dark-theme',
  },
};

export const AVAILABLE_LANGS: Record<AvailableLanguage, { value: AvailableLanguage; label: string }> = {
  en: { value: 'en', label: 'English' },
};
