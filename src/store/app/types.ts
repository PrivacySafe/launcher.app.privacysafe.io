import type { Store } from 'pinia';
import type { Actions } from './actions/types';
import type { AppGetters } from './getters/types';
import type { AppView, AvailableColorTheme, AvailableLanguage, ConnectivityStatus } from '@/types';

export interface AppStoreState {
  connectivityStatus: ConnectivityStatus;
  user: string;
  lang: AvailableLanguage;
  colorTheme: AvailableColorTheme;
  installedApplications: AppView[];
  applicationsForInstallAndUpdate: AppView[];
}

export type AppStore<G = AppGetters> = Store<'app', AppStoreState, G, Actions>;
