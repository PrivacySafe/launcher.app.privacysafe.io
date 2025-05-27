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
import { Ui3nButton, Ui3nProgressCircular } from '@v1nt1248/3nclient-lib';
import { useAppLauncher } from '@/common/composables/useAppLauncher';
import type { AppLaunchers } from '@/common/types';
import AppIcon from '@/common/components/app-icon.vue';

const props = defineProps<{
  launcher: AppLaunchers;
}>();

const propsValue = computed(() => props.launcher);

const {
  needToCloseOldVersion,
  canBeLaunched,
  appProcessToDisplay,
  launchDefault,
  closeOldVersionApps,
} = useAppLauncher(propsValue);
</script>

<template>
  <div :class="$style.appLauncher">
    <app-icon
      :icon-bytes="launcher.iconBytes"
      size="48"
    />

    <span :class="$style.name">{{ launcher.name }}</span>

    <span :class="$style.version">{{ launcher.version }}</span>

    <div
      v-if="launcher.defaultLauncher"
      :class="$style.action"
    >
      <ui3n-button
        v-if="needToCloseOldVersion"
        :class="$style.btn"
        @click="closeOldVersionApps"
      >
        {{ $tr('app.action.close-old-version') }}
      </ui3n-button>

      <ui3n-button
        v-if="canBeLaunched"
        :class="$style.btn"
        @click="launchDefault"
      >
        {{ $tr('app.action.open') }}
      </ui3n-button>
    </div>

    <div
      v-if="!!appProcessToDisplay"
      :class="$style.loader"
    >
      <ui3n-progress-circular
        size="64"
        with-text
        :value="appProcessToDisplay.progressValue"
      />
    </div>
  </div>
</template>

<style lang="scss" module>
.appLauncher {
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

.loader {
  position: absolute;
  inset: 0;
  background-color: var(--shadow-key-1);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
