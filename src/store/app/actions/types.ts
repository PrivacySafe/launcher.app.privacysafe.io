import type { PiniaActionTree } from '@v1nt1248/3nclient-lib/plugins';
import type { AppStore } from '../types';
import type { AvailableColorTheme, AvailableLanguage } from '@/types';
import { AppConfigsInternal, SettingsJSON } from '@/services/ui-settings';

export type Actions = {
  getConnectivityStatus(): Promise<void>;
  getUser(): Promise<void>;
  setLang(lang: AvailableLanguage): void;
  setColorTheme(theme: AvailableColorTheme): void;
  getAppConfig(): Promise<AppConfigsInternal | undefined>;
  updateAppConfig(appConfig: Partial<SettingsJSON>): Promise<void>;
  getInstalledApplications(): Promise<void>;
  prepareAppListForInstallAndUpdate(): Promise<void>;
};

export type AppActions = PiniaActionTree<Actions, AppStore>;
