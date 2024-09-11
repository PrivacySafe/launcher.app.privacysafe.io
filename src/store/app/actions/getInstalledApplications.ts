import { NOT_DISPLAYED_APPLICATIONS } from '@/constants';
import { AppActions } from '@/store/app/actions/types';
import { AppView, AppViewManifest } from '@/types';

export const getInstalledApplications: AppActions['getInstalledApplications'] = async function (this) {
  const list: AppView[] | undefined = await w3n.apps?.opener?.listApps();
  const filteredList = (list || []).filter(item => !NOT_DISPLAYED_APPLICATIONS.includes(item.id) && !!item.current);
  for (const item of filteredList) {
    const manifest = (await w3n.apps?.opener?.getAppManifest(item.id, item.current)) as AppViewManifest;
    item.manifest = manifest;
    if (
      manifest?.launchOnSystemStartup &&
      manifest?.launchOnSystemStartup[0] &&
      manifest?.launchOnSystemStartup[0].icon
    ) {
      const file = await w3n.apps?.opener?.getAppFileBytes(
        item.id,
        manifest.launchOnSystemStartup[0].icon,
        item.current,
      );
      file && (item.manifest!.launchOnSystemStartup[0].iconFile = file);
    }
  }
  this.installedApplications = filteredList;
};
