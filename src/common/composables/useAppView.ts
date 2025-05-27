import { computed, inject, type ComputedRef } from 'vue';
import { storeToRefs } from 'pinia';
import { I18N_KEY } from '@v1nt1248/3nclient-lib/plugins';
import { updateVersionIn } from '@/common/utils/versions';
import type { AppInfo } from '@/common/types';
import { useAppsStore } from '@/common/store/apps.store';

export function useAppView(props: ComputedRef<AppInfo>) {
  const { $tr } = inject(I18N_KEY)!;

  const appId = computed(() => props.value.appId);

  const appsStore = useAppsStore();
  const { downloadAndInstallApp, installBundledApp, closeOldVersionApps, updateAppsAndLaunchersInfo } = appsStore;
  const { restart, processes } = storeToRefs(appsStore);
  const needToCloseOldVersion = computed(() => !!restart.value?.apps?.includes(appId.value));
  const appProcesses = computed(() => processes.value[appId.value]);

  const installProc = computed(() => appProcesses.value?.find(({ procType }) => procType === 'installing'));

  const downloadOrUnzipProc = computed(() =>
    appProcesses.value?.find(({ procType }) => procType === 'downloading' || procType === 'unzipping'),
  );

  const canBeInstalled = computed(() => !appProcesses.value && !props.value.versions.current);

  const canBeUpdated = computed(() => !appProcesses.value && !!(props.value.updates || props.value.updateFromBundle));

  async function install() {
    await installBundledApp(appId.value, props.value.versions.bundled!);
  }

  async function update() {
    try {
      const { version, isBundledVersion } = updateVersionIn(props.value)!;
      if (isBundledVersion) {
        await installBundledApp(appId.value, version);
      } else {
        await downloadAndInstallApp(props.value, version);
      }
    } finally {
      await updateAppsAndLaunchersInfo();
    }
  }

  return {
    $tr,
    appId,
    canBeInstalled,
    canBeUpdated,
    needToCloseOldVersion,
    install,
    update,
    closeOldVersionApps,
    installProc,
    downloadOrUnzipProc,
  };
}
