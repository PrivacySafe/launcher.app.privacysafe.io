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
import { computed, inject } from 'vue';
import { storeToRefs } from 'pinia';
import {
  I18N_KEY,
  I18nPlugin,
} from '@v1nt1248/3nclient-lib/plugins';
import AppLaunchers from '@/components/app-launchers.vue';
import AppView from '@/components/app-view.vue';
import { useAppsStore } from '@/store/apps.store';

const { $tr } = inject<I18nPlugin>(I18N_KEY)!;

const appsStore = useAppsStore();
const {
  appLaunchers, applicationsInSystem, processes
} = storeToRefs(appsStore);

const newApps = computed(
  () => Object.entries(processes.value)
  .filter(([ appId, appProcs]) => (
    !appLaunchers.value.find(installedApp => (installedApp.appId === appId)) &&
    !!appProcs.find(({ procType }) =>
      (procType === 'downloading') ||
      (procType === 'unzipping') ||
      (procType === 'installing')
    )
  ))
  .map(([ appId ]) => applicationsInSystem.value.find(
    app => (app.appId === appId)
  )!)
  .filter(app => !!app)
);

const nothingToShow = computed(() => (
  (appLaunchers.value.length === 0) && (newApps.value.length === 0)
));

</script>

<template>
  <section :class="$style.applications">
    <!-- <platform-restart /> -->

    <div
      v-if="nothingToShow"
      :class="$style.empty"
    >
      {{ $tr('app.list.empty') }}
    </div>

    <app-view
      v-for="app in newApps"
      :key="app.appId"
      :app-info="app"
    />

    <app-launchers
      v-for="app in appLaunchers"
      :key="app.appId+app.version"
      :launchers="app"
    />

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
</style>
