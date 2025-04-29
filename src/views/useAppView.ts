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

import { initializationOfServices } from "@/services";
import { useAppStore } from "@/store/app.store";
import { useAppsStore } from "@/store/apps.store";
import { GlobalEvents } from "@/types";
import { I18N_KEY, I18nPlugin, NOTIFICATIONS_KEY, NotificationsPlugin, VUEBUS_KEY, VueBusPlugin } from "@v1nt1248/3nclient-lib/plugins";
import { storeToRefs } from "pinia";
import { computed, inject, ref } from "vue";

export type AppViewInstance = ReturnType<typeof useAppView>;

export function useAppView() {

  const appStore = useAppStore();
  const {
    appVersion, user, connectivityStatus, appElement
  } = storeToRefs(appStore);

  const connectivityStatusText = computed(() =>
    connectivityStatus.value === 'online' ?
    'app.status.connected.online' : 'app.status.connected.offline'
  );
  
  const appsStore = useAppsStore();
  const {
    restart, applicationsInSystem, platform,
  } = storeToRefs(appsStore);
  const {
    checkAndInstallAllUpdates, updateAppsAndLaunchersInfo,
    checkForAllUpdates
  } = appsStore;

  const { $tr } = inject<I18nPlugin>(I18N_KEY)!;

  async function appExit() {
    w3n.closeSelf();
  }

  const { $createNotice } = inject<NotificationsPlugin>(NOTIFICATIONS_KEY)!;

  async function checkForUpdate() {
    try {
    checkProcIsOn.value = true;
    $createNotice({
      content: $tr('update-check.start'),
      type: 'info'
    });
    await checkForAllUpdates(true);
    let numOfUpdates = applicationsInSystem.value
    .filter(app => !!app.updates).length;
    if (platform.value.availableUpdates) {
      numOfUpdates += 1;
    }
    let content = ((numOfUpdates > 0) ?
      $tr('update-check.updates-found', { numOfUpdates: `${numOfUpdates}` }) :
      $tr('update-check.no-updates')
    );
    $createNotice({ content, type: 'success' });
    } finally {
    checkProcIsOn.value = false;
    }
  }
  const checkProcIsOn = ref(false);

  const { $emitter } = inject<VueBusPlugin<GlobalEvents>>(VUEBUS_KEY)!;

  $emitter.once('init-setup:start', ev => $createNotice({
    content: $tr('system.init-setup-start', {
    appsList: ev.bundledAppsForInstall.join(', ')
    }),
    type: 'info'
  }));

  $emitter.once('init-setup:done', ev => $createNotice({
    content: $tr('system.init-setup-done'),
    type: 'success'
  }));

  const needPlatformRestartAfterUpdate = computed(
    () => !!restart.value?.platform
  );

  function quitAndInstall() {
    w3n.system!.platform!.quitAndInstall();
  }

  function triggerOnStart(): void {
    // trigger, but don't wait here
    updateAppsAndLaunchersInfo()
    .then(async () => {
    if (connectivityStatus.value === 'online') {
      await checkAndInstallAllUpdates();
    }
    });
  }

  async function doBeforeMount() {
    try {
      await Promise.all([
        initializationOfServices($emitter),
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
    needPlatformRestartAfterUpdate,
    checkProcIsOn,
    user,

    appExit,
    quitAndInstall,
    checkForUpdate,

    doBeforeMount,
    doBeforeUnmount
  };
}
