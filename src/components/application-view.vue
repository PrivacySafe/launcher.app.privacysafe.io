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
import { get } from 'lodash';
import {
  VUEBUS_KEY,
  VueBusPlugin,
  I18N_KEY,
  I18nPlugin,
  NOTIFICATIONS_KEY,
  NotificationsPlugin,
} from '@v1nt1248/3nclient-lib/plugins';
import { Ui3nButton, Ui3nProgressCircular } from '@v1nt1248/3nclient-lib';
import { useProcessStore } from '@/store';
import { AppView, UpdateAndInstallEvents } from '@/types';
import AppIcon from './app-icon.vue';
import ApplicationItemArea from './application-item-area.vue';

const props = withDefaults(
  defineProps<{
    application: AppView;
    installedApps?: AppView[];
  }>(),
  {
    installedApps: () => [],
  },
);

const { $emitter } = inject<VueBusPlugin<UpdateAndInstallEvents>>(VUEBUS_KEY)!;
const { $tr } = inject<I18nPlugin>(I18N_KEY)!;
const { $createNotice } = inject<NotificationsPlugin>(NOTIFICATIONS_KEY)!;
const processStore = useProcessStore();
const { upsertProcess, delProcess } = processStore;
const { processes } = storeToRefs(processStore);

const currentProcess = computed(() => get(processes.value, [props.application.id]));

const isAppInstalled = computed(() => {
  const installedAppsIds = props.installedApps.map(a => a.id);
  return installedAppsIds.includes(props.application.id);
});

const canInstall = computed(() => !isAppInstalled.value);

const actionBtn = computed(() => {
  return canInstall.value ? $tr('app.action.install') : $tr('app.action.update');
});

const iconFile = computed(() => get(props.application, ['manifest', 'launchOnSystemStartup', '0', 'iconFile']));

const descriptionTitle = computed(() => get(props.application, ['manifest', 'launchOnSystemStartup', '0', 'name']) || get(props.application, ['manifest', 'name']));

const description = computed(() => get(props.application, ['manifest', 'launchOnSystemStartup', '0', 'description']));

const actionBtnBgColor = computed(() => {
  return (isAppInstalled.value ?
    'var(--color-bg-button-secondary-default)' :
    'var(--color-bg-button-primary-default)'
  );
});

const actionBtnTextColor = computed(() => {
  return (isAppInstalled.value ?
    'var(--color-text-button-secondary-default)' :
    'var(--color-text-button-primary-default)'
  );
});

const actionBtnDisable = computed(() => {
  if (!isAppInstalled.value) return false;

  const installedApp = props.installedApps.find(a => a.id === props.application.id);
  return !installedApp ? false : installedApp.current === props.application.current;
});

async function installApp() {
  try {
    upsertProcess(props.application.id, { process: 'installing' });
    await w3n.system!.apps?.installer?.installApp(props.application.id, props.application.current!);
    $createNotice({
      type: 'success',
      content: $tr('app.install.success', { name: props.application.manifest?.name || '' }),
    });
    $emitter.emit('install:complete', null);
  } catch (err) {
    console.error(`The ${props.application.id} application installing error. `, err);
    $createNotice({
      type: 'error',
      content: $tr('app.install.error', { name: props.application.manifest?.name || '' }),
    });
  } finally {
    delProcess(props.application.id);
  }
}

function downloadApp(cbAfterDownload?: ({ appId, version }?: { appId: string; version: string}) => void) {
  upsertProcess(props.application.id, {  process: 'downloading', value: 0 });
  w3n.system!.apps!.downloader!.downloadWebApp(
    props.application.id,
    props.application.current!,
    {
      next: (progress: web3n.system.apps.DownloadProgress) => {
        const { bytesLeft, totalBytes } = progress;
        const downloadProgress = Math.round((totalBytes - bytesLeft) / totalBytes * 100);
        upsertProcess(props.application.id, {  process: 'downloading', value: downloadProgress });
      },
      error: err => {
        console.error(`The ${props.application.id} application downloading error. `, err)
        $createNotice({
          type: 'error',
          content: $tr('app.download.error', { name: props.application.manifest?.name || '' }),
        });
        delProcess(props.application.id);
      },
      complete: () => {
        cbAfterDownload && cbAfterDownload();
      },
    },
  );
}

function installAndUpdate() {
  downloadApp(installApp);
}

</script>

<template>
  <application-item-area>
    <template #main>
      <app-icon
        :iconBytes="iconFile"
      />

      <div :class="$style.content">
        <div :class="$style.name">
          {{ application.manifest?.name }}
        </div>

        <div :class="$style.version">
          v {{ application.current }}
        </div>
      </div>

      <div :class="$style.action">
        <ui3n-button
          :class="$style.btn"
          block
          type="custom"
          :color="actionBtnBgColor"
          :text-color="actionBtnTextColor"
          :disabled="actionBtnDisable"
          @click="installAndUpdate"
        >
          {{ actionBtn }}
        </ui3n-button>
      </div>
    </template>

    <template #other>
      <div :class="$style.description">
        <span v-if="descriptionTitle">{{ descriptionTitle }}</span>
        <span v-if="description">{{ description }}</span>
        <span v-if="application.id" :class="$style.accented">{{ application.id }}</span>
      </div>

      <div v-if="!!currentProcess" :class="$style.loading">
        <ui3n-progress-circular
          v-if="currentProcess.process === 'installing'"
          indeterminate
          size="40"
        />

        <ui3n-progress-circular
          v-if="currentProcess.process === 'downloading'"
          size="40"
          with-text
          :value="currentProcess.value"
        />
      </div>
    </template>
  </application-item-area>
</template>

<style lang="scss" module>

.content {
  position: relative;
  width: calc(100% - 4 * var(--spacing-ml) - 2 * var(--spacing-s));
}

.name {
  font-size: var(--font-16);
  font-weight: 500;
  line-height: var(--font-20);
  color: var(--color-text-block-primary-default);
}

.version {
  font-size: var(--font-10);
  font-weight: 500;
  line-height: var(--font-12);
  color: var(--color-text-block-secondary-default);
}

.action {
  position: relative;
  width: var(--action-block-width);

  .btn {
    text-transform: capitalize;
  }
}

.description {
  position: relative;
  width: calc(100% - var(--action-block-width) - var(--spacing-s));
  margin-top: var(--spacing-s);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: var(--spacing-xs);
  font-size: var(--font-12);
  font-weight: 400;
  line-height: var(--font-16);
  color: var(--color-text-block-primary-default);
}

.accented {
  color: var(--color-text-block-accent-default);
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
