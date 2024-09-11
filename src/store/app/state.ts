import { AppStoreState } from './types';

export const state: AppStoreState = {
  connectivityStatus: 'offline',
  user: '',
  lang: 'en',
  colorTheme: 'default',
  installedApplications: [],
  applicationsForInstallAndUpdate: [],
};
