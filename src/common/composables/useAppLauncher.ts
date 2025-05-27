import { computed, ComputedRef } from 'vue';
import { storeToRefs } from 'pinia';
import { AppLaunchers, Launcher } from '@/common/types';
import { useAppsStore } from '@/common/store/apps.store';

export function useAppLauncher(props: ComputedRef<AppLaunchers>) {
  const appId = computed(() => props.value.appId);

  const appsStore = useAppsStore();
  const { closeOldVersionApps } = appsStore;
  const { restart, processes } = storeToRefs(appsStore);
  const needToCloseOldVersion = computed(() => !!restart.value?.apps?.includes(appId.value));
  const appProcesses = computed(() => processes.value[appId.value]);

  const canBeLaunched = computed(
    () =>
      !needToCloseOldVersion.value &&
      (!appProcesses.value || !appProcesses.value.find(({ procType }) => procType === 'installing')),
  );

  const appProcessToDisplay = computed(() =>
    appProcesses.value?.find(
      ({ procType }) => procType === 'installing' || procType === 'downloading' || procType === 'unzipping',
    ),
  );

  async function startLauncher(l: Launcher, devtools: boolean) {
    if (l.component) {
      await w3n.system!.apps!.opener!.openApp(appId.value, l.component, devtools);
    } else if (l.startCmd) {
      await w3n.system!.apps!.opener!.executeCommand(appId.value, l.startCmd, devtools);
    } else {
      throw new Error(`Malformed launcher: neither component, nor command found`);
    }
  }

  function launchDefault(ev: Event) {
    const devtools = (ev as PointerEvent).ctrlKey;
    startLauncher(props.value.defaultLauncher!, devtools);
  }

  return {
    needToCloseOldVersion,
    canBeLaunched,
    appProcessToDisplay,
    launchDefault,
    closeOldVersionApps,
  };
}
