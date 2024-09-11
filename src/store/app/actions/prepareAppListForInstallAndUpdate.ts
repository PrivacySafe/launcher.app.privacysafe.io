import type { AppActions } from '@/store/app/actions/types';
import type { AppView, AppViewManifest } from '@/types';

export const prepareAppListForInstallAndUpdate: AppActions['prepareAppListForInstallAndUpdate'] = async function (
  this,
) {
  const data: Record<string, AppView> = {};
  for (const appId of this.applicationsIdsForInstallAndUpdate) {
    const version = await w3n.apps?.downloader?.getLatestAppVersion(appId, 'nightly');
    const manifest = (await w3n.apps?.opener?.getAppManifest(appId, version)) as AppViewManifest;
    if (
      manifest?.launchOnSystemStartup &&
      manifest?.launchOnSystemStartup[0] &&
      manifest.launchOnSystemStartup[0].icon
    ) {
      const file = await w3n.apps?.opener?.getAppFileBytes(appId, manifest.launchOnSystemStartup[0].icon, version);
      manifest.launchOnSystemStartup[0].iconFile = file;
    }

    data[appId] = {
      id: appId,
      current: version,
      manifest,
    };
  }

  this.applicationsForInstallAndUpdate = Object.values(data);
};
