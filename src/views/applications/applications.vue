<!--
 Copyright (C) 2024 3NSoft Inc.

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
-->

<script lang="ts" setup>
import { inject, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { isEmpty } from 'lodash';
import {
  I18N_KEY,
  I18nPlugin,
  NOTIFICATIONS_KEY,
  NotificationsPlugin,
  VUEBUS_KEY,
  VueBusPlugin,
} from '@v1nt1248/3nclient-lib/plugins';
import { useAppStore } from '@/store';
import AppLaunchers from '@/components/app-launchers.vue';
import { Ui3nProgressCircular } from '@v1nt1248/3nclient-lib';
import { UpdateAndInstallEvents } from '@/types';
import { updateAppsLaunchersInfoInStore } from '@/ctrl-funcs/updateAppsLaunchersInfoInStore';

const { $emitter } = inject<VueBusPlugin<UpdateAndInstallEvents>>(VUEBUS_KEY)!;
const { $createNotice } = inject<NotificationsPlugin>(NOTIFICATIONS_KEY)!;
const { $tr } = inject<I18nPlugin>(I18N_KEY)!;

const appStore = useAppStore();
const { appLaunchers } = storeToRefs(appStore);

const isLoading = ref(false);

$emitter.on('install:complete', loadInstalledApplicationsInfo);

async function loadInstalledApplicationsInfo() {
  try {
    isLoading.value = true;
    await updateAppsLaunchersInfoInStore(true);
  } catch (err) {
    console.error('The load information installed applications error.', err);
    $createNotice({
      type: 'warning',
      content: $tr('app.installed.load.info.error'),
    });
  } finally {
    isLoading.value = false;
  }
}

async function loadInstalledApplicationsInfoAfterInstall() {
  await loadInstalledApplicationsInfo();
  $emitter.emit('install:complete:next', null);
}

onBeforeMount(async () => {
  await loadInstalledApplicationsInfo();
});

onBeforeUnmount(() => {
  $emitter.off('install:complete', loadInstalledApplicationsInfoAfterInstall);
});
</script>

<template>
  <section :class="$style.applications">
    <div
      v-if="isEmpty(appLaunchers)"
      :class="$style.empty"
    >
      {{ $tr('app.list.empty') }}
    </div>

    <template v-else>
      <app-launchers
        v-for="app in appLaunchers"
        :key="app.appId+app.version"
        :launchers="app"
      />
    </template>

    <div
      v-if="isLoading"
      :class="$style.loading"
    >
      <ui3n-progress-circular indeterminate size="64" />
    </div>
  </section>
</template>

<style lang="scss" module>
.applications {
  position: relative;
  width: 100%;
  height: 100%;
  padding: var(--spacing-m);
  overflow-y: auto;
}

.empty {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 var(--spacing-m);
  font-size: var(--font-18);
  line-height: var(--font-24);
  color: var(--color-text-block-primary-default);
}

.loading {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
