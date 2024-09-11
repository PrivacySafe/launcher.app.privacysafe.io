import type { AppActions } from './types';
import { getConnectivityStatus } from './getConnectivityStatus';
import { getUser } from './getUser';
import { setLang } from './setLang';
import { setColorTheme } from './setColorTheme';
import { getAppConfig } from './getAppConfig';
import { updateAppConfig } from './updateAppConfig';
import { getInstalledApplications } from './getInstalledApplications';
import { prepareAppListForInstallAndUpdate } from './prepareAppListForInstallAndUpdate';

export const appActions: AppActions = {
  getConnectivityStatus,
  getUser,
  setLang,
  setColorTheme,
  getAppConfig,
  updateAppConfig,
  getInstalledApplications,
  prepareAppListForInstallAndUpdate,
};
