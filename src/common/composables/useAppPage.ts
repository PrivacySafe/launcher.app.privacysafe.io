/*
 Copyright (C) 2024 - 2025 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under
 the terms of the GNU General Public License as published by the Free Software
 Foundation, either version 3 of the License, or (at your option) any later
 version.

 This program is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with
 this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { computed, inject, ref } from 'vue';
import { storeToRefs } from 'pinia';
import {
  I18N_KEY,
  NOTIFICATIONS_KEY,
  VUEBUS_KEY,
  VueBusPlugin,
} from '@v1nt1248/3nclient-lib/plugins';
import { useAppStore } from '@/common/store/app.store';
import { useAppsStore } from '@/common/store/apps.store';
import { GlobalEvents } from '@/common/types';

export type AppViewInstance = ReturnType<typeof useAppPage>;

export function useAppPage() {

  const appStore = useAppStore();
  const { appVersion, user, connectivityStatus, appElement, customLogoSrc } = storeToRefs(appStore);

  const appsStore = useAppsStore();
  const { restart, applicationsInSystem, platform } = storeToRefs(appsStore);
  const {
    checkAndInstallAllUpdates, updateAppsAndLaunchersInfo, fetchCachedInfo, checkForAllUpdates,
    addAppPackFromFile
  } = appsStore;

  const { $tr } = inject(I18N_KEY)!;
  const { $emitter } = inject<VueBusPlugin<GlobalEvents>>(VUEBUS_KEY)!;
  const { $createNotice } = inject(NOTIFICATIONS_KEY)!;

  const checkProcIsOn = ref(false);

  const connectivityStatusText = computed(() =>
    connectivityStatus.value === 'online' ? 'app.status.connected.online' : 'app.status.connected.offline',
  );

  const needPlatformRestartAfterUpdate = computed(() => !!restart.value?.platform);

  async function appExit() {
    w3n.closeSelf();
  }

  async function checkForUpdate() {
    try {
      checkProcIsOn.value = true;
      $createNotice({
        content: $tr('update-check.start'),
        type: 'info',
      });
      await checkForAllUpdates(true);
      let numOfUpdates = applicationsInSystem.value.filter(app => !!(app.updates || app.updateFromBundle)).length;
      if (platform.value.availableUpdates) {
        numOfUpdates += 1;
      }
      const content =
        numOfUpdates > 0
          ? $tr('update-check.updates-found', { numOfUpdates: `${numOfUpdates}` })
          : $tr('update-check.no-updates');
      $createNotice({ content, type: 'success' });
    } finally {
      checkProcIsOn.value = false;
    }
  }

  $emitter.once('init-setup:start', ev =>
    $createNotice({
      content: $tr('system.init-setup-start', {
        appsList: ev.bundledAppsForInstall.join(', '),
      }),
      type: 'info',
    }),
  );

  $emitter.once('init-setup:done', () =>
    $createNotice({
      content: $tr('system.init-setup-done'),
      type: 'success',
    }),
  );

  function quitAndInstall() {
    w3n.system!.platform!.quitAndInstall();
  }

  function triggerOnStart(): void {
    // trigger, but don't wait here
    fetchCachedInfo().then(async () => {
      await updateAppsAndLaunchersInfo();
      if (connectivityStatus.value === 'online') {
        await checkAndInstallAllUpdates();
      }
    });
  }

  async function addAppFromFile() {
    const filesWithApps = await w3n.shell!.fileDialogs!.openFileDialog!(
      "Choose 3NWeb App file", "Add App", true,
      [{ name: "", extensions: [ '3nw', '3nweb', 'zip' ] }]
    );
    if (!filesWithApps) {
      return;
    }
    for (const file of filesWithApps) {
      await addAppPackFromFile(file);
    }
  }

  async function doBeforeMount() {
    try {
      await Promise.all([
        appStore.initialize(),
        appsStore.initialize()
      ]);

      triggerOnStart();
    } catch (e) {
      console.error('App view mounting error:', e);
      throw e;
    }
  }

  function doBeforeUnmount() {
    appStore.stopWatching();
  }

  return {
    appVersion,
    appElement,
    connectivityStatus,
    connectivityStatusText,
    customLogoSrc,
    needPlatformRestartAfterUpdate,
    checkProcIsOn,
    user,

    appExit,
    quitAndInstall,
    checkForUpdate,
    addAppFromFile,

    doBeforeMount,
    doBeforeUnmount
  };
}
