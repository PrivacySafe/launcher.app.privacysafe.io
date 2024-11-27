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
import { Ui3nButton, Ui3nProgressCircular } from '@v1nt1248/3nclient-lib';
import { useAppStore, useProcessStore } from '@/store';
import { AppInfo } from '@/types';
import AppIcon from './app-icon.vue';
import AppItemArea from './app-item-area.vue';
import { installBundledApp, updateAppsAndLaunchersInfoInStore } from '@/ctrl-funcs';
import { downloadAndInstallApp } from '@/ctrl-funcs';
import { updateVersionIn } from '@/utils';
import { closeOldVersionApps } from '@/ctrl-funcs/closeOldVersionApps';

const props = defineProps<{
  appInfo: AppInfo;
}>();
const { appId } = props.appInfo;

const { $tr } = inject<I18nPlugin>(I18N_KEY)!;

const appStore = useAppStore();
const { restart } = storeToRefs(appStore);
const needToCloseOldVersion = computed(
  () => !!restart.value?.apps?.includes(appId)
);

const processStore = useProcessStore();
const { processes } = storeToRefs(processStore);
const appProcesses = computed(() => processes.value[appId]);

const installProc = computed(() => appProcesses.value?.find(
  ({ procType }) => (procType === 'installing')
));

const downloadOrUnzipProc = computed(() => appProcesses.value?.find(
  ({ procType }) => (
    (procType === 'downloading') || (procType === 'unzipping')
  )
));

const canBeInstalled = computed(() => (
  !appProcesses.value && !props.appInfo.versions.current
));
const canBeUpdated = computed(() => (
  !appProcesses.value &&
  !!(props.appInfo.updates || props.appInfo.updateFromBundle)
));

async function install() {
  await installBundledApp(appId, props.appInfo.versions.bundled!);
}

async function update() {
  try {
    const { version, isBundledVersion } = updateVersionIn(props.appInfo)!;
    if (isBundledVersion) {
      await installBundledApp(appId, version);
    } else {
      await downloadAndInstallApp(props.appInfo, version, processStore);
    }
  } finally {
    await updateAppsAndLaunchersInfoInStore();
  }
}

</script>

<template>
  <app-item-area>
    <template #main>
      <app-icon
        :iconBytes=appInfo.iconBytes
      />

      <div :class="$style.content">
        <div :class="$style.name">
          {{ appInfo.name }}
        </div>

        <div :class="$style.version">
          {{ $tr('version', { version: appInfo.versions.latest }) }}
        </div>
      </div>

      <div :class="$style.action">
        <ui3n-button
          v-if="canBeInstalled"
          :class="$style.btn"
          block
          type="primary"
          @click="install"
        >
          {{ $tr('app.action.install') }}
        </ui3n-button>

        <ui3n-button
          v-if="canBeUpdated"
          :class="$style.btn"
          block
          type="primary"
          @click="update"
        >
          {{ $tr('app.action.update') }}
        </ui3n-button>

        <ui3n-button
          v-if="needToCloseOldVersion"
          :class="$style.btn"
          block
          @click="closeOldVersionApps"
        >
          {{ $tr('app.action.close-old-version') }}
        </ui3n-button>
      </div>
    </template>

    <template #other>
      <div :class=$style.description>
        <span v-if="appInfo.description">{{ appInfo.description }}</span>
        <span :class="$style.accented">{{ appId }}</span>
      </div>

      <div :class=$style.progressOverlay
        v-if="!!installProc"
      >
        <ui3n-progress-circular
          indeterminate
          size="40"
        />
      </div>

      <div :class=$style.progressOverlay
        v-if="!!downloadOrUnzipProc"
      >
        <ui3n-progress-circular
          size="40"
          with-text
          :value="downloadOrUnzipProc.progressValue"
        />
      </div>
    </template>
  </app-item-area>
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

.progressOverlay {
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
