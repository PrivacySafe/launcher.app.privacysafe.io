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
import { computed, inject, ref } from 'vue';
import { storeToRefs } from 'pinia';
import isEmpty from 'lodash/isEmpty';
import { I18N_KEY, NOTIFICATIONS_KEY } from '@v1nt1248/3nclient-lib/plugins';
import { Ui3nButton, Ui3nInput, Ui3nProgressCircular } from '@v1nt1248/3nclient-lib';
import { useAppStore } from '@/common/store/app.store';
import { useAppsStore } from '@/common/store/apps.store';
import PlatformView from '@/desktop/components/platform-view.vue';
import AppInfo from '@/mobile/components/app-info/app-info.vue';

const { $tr } = inject(I18N_KEY)!;
const { $createNotice } = inject(NOTIFICATIONS_KEY)!;

const appStore = useAppStore();
const { connectivityStatus } = storeToRefs(appStore);

const appsStore = useAppsStore();
const { applicationsInSystem, platform } = storeToRefs(appsStore);
const { checkForAllUpdates } = appsStore;

const search = ref('');
const checkProcIsOn = ref(false);

const filteredApps = computed(() => applicationsInSystem.value
  .filter(({ name }) => {
    const searchStr = search.value.trim().toLowerCase();
    return name.toLowerCase().includes(searchStr);
  }),
);

async function checkForUpdate() {
  try {
    checkProcIsOn.value = true;

    $createNotice({
      content: $tr('update-check.start'),
      type: 'info',
    });

    await checkForAllUpdates(true);
    let numOfUpdates = applicationsInSystem.value.filter(app => !!app.updates).length;
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
</script>

<template>
  <div :class="$style.appStore">
    <div
      v-if="connectivityStatus === 'online'"
      :class="$style.action"
    >
      <ui3n-button
        :disabled="checkProcIsOn"
        @click="checkForUpdate"
      >
        {{ checkProcIsOn ? `${$tr('btn.checking-for-update')} ...` : $tr('btn.check-update') }}
      </ui3n-button>
    </div>

    <platform-view />

    <ui3n-input
      v-model="search"
      :placeholder="$tr('app.update.search.placeholder')"
      clearable
      icon="round-search"
      autofocus
      :class="$style.search"
    />

    <div
      v-if="isEmpty(filteredApps)"
      :class="$style.empty"
    >
      {{ $tr('app.list.empty') }}
    </div>

    <div
      v-else
      :class="$style.apps"
    >
      <app-info
        v-for="app in filteredApps"
        :key="app.appId"
        :app-info="app"
      />
    </div>

    <div
      v-if="checkProcIsOn"
      :class="$style.loader"
    >
      <ui3n-progress-circular
        size="64"
        indeterminate
      />
    </div>
  </div>
</template>

<style lang="scss" module>
.appStore {
  position: relative;
  width: 100%;
  height: 100%;
  padding: var(--spacing-m);
  overflow-x: hidden;
  overflow-y: auto;
  background-color: var(--color-bg-block-primary-default);
}

.action {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  margin-bottom: var(--spacing-m);
}

.search {
  margin: var(--spacing-ml) 0 var(--spacing-m);
}

.empty {
  position: relative;
  width: 100%;
  text-align: center;
  padding: var(--spacing-l) 0;
  font-size: var(--font-18);
  line-height: var(--font-24);
  color: var(--color-text-block-primary-default);
}

.apps {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-m);
}

.loader {
  position: absolute;
  inset: 0;
  background-color: var(--shadow-key-1);
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  z-index: 5
}
</style>
