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
import { computed } from 'vue';
import { Ui3nButton } from '@v1nt1248/3nclient-lib';
import type { AppInfo } from '@/common/types';
import { useAppView } from '@/common/composables/useAppView';
import AppIcon from '@/common/components/app-icon.vue';
import { Ui3nProgressCircular } from '@v1nt1248/3nclient-lib';

const props = defineProps<{
  appInfo: AppInfo;
}>();

const propsValue = computed(() => props.appInfo);

const {
  $tr,
  appId,
  canBeInstalled,
  versionToInstall,
  canBeUpdated,
  versionInUpdate,
  needToCloseOldVersion,
  install,
  update,
  closeOldVersionApps,
  installProc,
  downloadOrUnzipProc,
} = useAppView(propsValue);
</script>

<template>
  <div :class="$style.appInfo">
    <app-icon
      :icon-bytes="appInfo.iconBytes"
      size="48"
    />

    <span :class="$style.name">
      {{ appInfo.name }}
    </span>

    <span :class="$style.version">
      {{
        canBeInstalled ? $tr('version.to-install', { install: versionToInstall! }) :
        versionInUpdate ? $tr('version.to-update', {
          current: appInfo.versions.current!, update: versionInUpdate!.version
        }) : $tr('version', { version: appInfo.versions.current! })
      }}
    </span>

    <span
      v-if="appInfo.description"
      :class="$style.description"
    >
      {{ appInfo.description }}
    </span>

    <span :class="$style.accented">
      {{ appId }}
    </span>

    <div :class="$style.action">
      <ui3n-button
        v-if="canBeInstalled"
        type="primary"
        @click="install"
      >
        {{ $tr('app.action.install') }}
      </ui3n-button>

      <ui3n-button
        v-if="canBeUpdated"
        type="primary"
        @click="update"
      >
        {{ $tr('app.action.update') }}
      </ui3n-button>

      <ui3n-button
        v-if="needToCloseOldVersion"
        type="primary"
        @click="closeOldVersionApps"
      >
        {{ $tr('app.action.close-old-version') }}
      </ui3n-button>
    </div>

    <div
      v-if="!!downloadOrUnzipProc || !!installProc"
      :class="$style.loader"
    >
      <ui3n-progress-circular
        v-if="!!installProc"
        indeterminate
        size="64"
      />

      <ui3n-progress-circular
        v-if="!!downloadOrUnzipProc"
        size="64"
        with-text
        :value="downloadOrUnzipProc.progressValue"
      />
    </div>
  </div>
</template>

<style lang="scss" module>
.appInfo {
  position: relative;
  padding: var(--spacing-m) var(--spacing-m) 64px var(--spacing-m);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  justify-items: stretch;
  row-gap: var(--spacing-s);
  width: 100%;
  border-radius: var(--spacing-s);
  background-color: var(--color-bg-control-secondary-default);
}


.name {
  font-size: var(--font-16);
  font-weight: 500;
  line-height: var(--font-20);
  color: var(--color-text-block-primary-default);
  text-align: center;
}

.version {
  font-size: var(--font-14);
  font-weight: 500;
  color: var(--color-text-block-secondary-default);
}

.action {
  position: absolute;
  bottom: var(--spacing-m);
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  button {
    text-transform: capitalize;
  }
}

.description {
  align-self: flex-start;
  font-size: var(--font-14);
  font-weight: 500;
  color: var(--color-text-block-primary-default);
  text-align: left;
}

.accented {
  align-self: flex-start;
  font-size: var(--font-10);
  color: var(--color-text-block-accent-default);
  word-break: break-word;
  text-align: left;
}

.loader {
  position: absolute;
  inset: 0;
  background-color: var(--shadow-key-1);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
