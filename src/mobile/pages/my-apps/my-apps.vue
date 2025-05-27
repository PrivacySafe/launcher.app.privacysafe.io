<!--
 Copyright (C) 2025 3NSoft Inc.

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
import isEmpty from 'lodash/isEmpty';
import { I18N_KEY, I18nPlugin } from '@v1nt1248/3nclient-lib/plugins';
import { useAppsStore } from '@/common/store/apps.store';
import AppLauncher from '@/mobile/components/app-launcher/app-launcher.vue';

const { $tr } = inject<I18nPlugin>(I18N_KEY)!;

const appsStore = useAppsStore();
const { appLaunchers } = storeToRefs(appsStore);

const nothingToShow = computed(() => isEmpty(appLaunchers.value));
</script>

<template>
  <div :class="$style.myApps">
    <div
      v-if="nothingToShow"
      :class="$style.installing"
    >
      {{ $tr('install.process') }} ...
    </div>

    <template v-else>
      <div :class="$style.apps">
        <template
          v-for="launcher in appLaunchers"
          :key="`${launcher.appId}-${launcher.version}`"
        >
          <app-launcher :launcher="launcher" />
        </template>
      </div>
    </template>
  </div>
</template>

<style lang="scss" module>
.myApps {
  position: relative;
  width: 100%;
  height: 100%;
  padding: var(--spacing-m);
  overflow-x: hidden;
  overflow-y: auto;
  background-color: var(--color-bg-block-primary-default);
}

.installing {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: var(--font-16);
  font-weight: 500;
  line-height: var(--spacing-ml);
  color: var(--color-text-block-primary-default);
  text-align: center;
}

.apps {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-m);
}

.appLauncher {
  position: relative;
  padding: var(--spacing-m);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  row-gap: var(--spacing-s);
  width: 100%;
  border-radius: var(--spacing-s);
  background-color: var(--color-bg-control-secondary-default);
  margin-bottom: var(--spacing-s);
}

.name {
  font-size: var(--font-16);
  font-weight: 500;
  line-height: var(--font-20);
  color: var(--color-text-block-primary-default);
}

.version {
  font-size: var(--font-14);
  font-weight: 500;
  color: var(--color-text-block-secondary-default);
}
</style>
