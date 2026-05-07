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
  import { computed, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { storeToRefs } from 'pinia';
  import isEmpty from 'lodash/isEmpty';
  import { Ui3nInput } from '@v1nt1248/3nclient-lib';
  import { useAppsStore } from '@/common/store/apps.store';
  import type { AppInfo } from '@/common/types';
  import PlatformInfo from '@/mobile/components/platform-info.vue';
  import ApplicationInfo from '@/mobile/components/app-info.vue';
  import AppStoreItem from '@/mobile/components/app-store-item.vue';
  import { updateVersionIn } from '@/common/utils/versions';

  const { t } = useI18n();

  const appsStore = useAppsStore();
  const { applicationsInSystem, platform } = storeToRefs(appsStore);

  const search = ref('');
  const appData = ref<(AppInfo & { version: string }) | null>(null);

  const searchStr = computed(() => search.value.trim().toLowerCase());

  const filteredApps = computed(() =>
    applicationsInSystem.value.filter(({ name }) => name.toLowerCase().includes(searchStr.value)),
  );

  const isPlatformShowed = computed(() => t('platform.title').toLowerCase().includes(searchStr.value));

  function openInfo(appId: string) {
    let app: AppInfo | undefined = undefined;
    let versionInUpdate: { version: string; isBundledVersion: boolean } | undefined = undefined;

    if (appId !== 'platform') {
      app = applicationsInSystem.value.find(a => a.appId === appId);
      versionInUpdate = updateVersionIn(app!);
    }

    appData.value = {
      appId,
      name: appId === 'platform' ? t('platform.title') : app!.name,
      icon: '',
      iconBytes: appId === 'platform' ? undefined : app!.iconBytes,
      version:
        appId === 'platform'
          ? t('app.version', { version: platform.value.version })
          : versionInUpdate
            ? t('app.version', { version: versionInUpdate!.version })
            : t('app.version', { version: app!.versions.current }),
      description: appId === 'platform' ? t('platform.description') : app?.description || '',
      versions: appId === 'platform' ? ({} as AppInfo['versions']) : (app?.versions as AppInfo['versions']),
    };
  }
</script>

<template>
  <div :class="$style.appStore">
    <div :class="$style.searchBlock">
      <ui3n-input
        v-model="search"
        :placeholder="t('app.update.search_placeholder')"
        clearable
        icon="round-search"
        autofocus
        hide-bottom-space
      />
    </div>

    <div :class="$style.body">
      <template v-if="!isPlatformShowed && isEmpty(filteredApps)">
        <div :class="$style.empty">
          {{ t('app.list.empty') }}
        </div>
      </template>

      <template v-else>
        <platform-info
          v-if="isPlatformShowed"
          :platform="platform"
          app-store-mode
          @click="() => openInfo('platform')"
        />

        <application-info
          v-for="app in filteredApps"
          :key="app.appId"
          :app-info="app"
          app-store-mode
          @click="() => openInfo(app.appId)"
        />
      </template>
    </div>

    <app-store-item
      v-if="appData?.appId"
      :app-data="appData"
      @close="appData = null"
    />
  </div>
</template>

<style lang="scss" module>
  .appStore {
    position: relative;
    width: 100%;
    height: 100%;
    padding: var(--spacing-m) var(--spacing-xs) var(--spacing-m) var(--spacing-m);
    overflow-x: hidden;
    overflow-y: auto;
    background-color: var(--color-bg-block-primary-default);
  }

  .searchBlock {
    padding: 0 12px var(--spacing-m) 0;
  }

  .body {
    display: flex;
    width: 100%;
    height: calc(100% - var(--spacing-xxl) - var(--spacing-s));
    padding-right: var(--spacing-s);
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    row-gap: var(--spacing-s);
    overflow-x: hidden;
    overflow-y: auto;
  }

  .action {
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
    margin-bottom: var(--spacing-m);
  }

  .empty {
    position: relative;
    width: 100%;
    text-align: center;
    padding: var(--spacing-l) 0;
    font-size: var(--font-18);
    font-weight: 500;
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
    z-index: 5;
  }
</style>
