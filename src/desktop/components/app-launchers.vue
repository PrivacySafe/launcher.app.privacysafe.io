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
import { computed } from 'vue';
import { Ui3nButton, Ui3nProgressCircular } from '@v1nt1248/3nclient-lib';
import type { AppLaunchers } from '@/common/types';
import AppIcon from '@/common/components/app-icon.vue';
import ApplicationItemArea from './app-item-area.vue';
import { useAppLauncher } from '@/common/composables/useAppLauncher';

const props = defineProps<{
  launchers: AppLaunchers;
}>();

const propsValue = computed(() => props.launchers);

const {
  needToCloseOldVersion,
  canBeLaunched,
  appProcessToDisplay,
  launchDefault,
  closeOldVersionApps,
} = useAppLauncher(propsValue);
</script>

<template>
  <application-item-area>
    <template #main>
      <app-icon :icon-bytes="launchers.iconBytes" />
      <div :class="$style.content">
        <div :class="$style.name">
          {{ launchers.name }}
        </div>

        <div :class="$style.version">
          v {{ launchers.version }}
        </div>
      </div>

      <div
        v-if="!!launchers.defaultLauncher"
        :class="$style.action"
      >
        <ui3n-button
          v-if="canBeLaunched"
          :class="$style.btn"
          block
          @click="launchDefault"
        >
          {{ $tr('app.action.open') }}
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
      <div
        v-if="!!appProcessToDisplay"
        :class="$style.progressOverlay"
      >
        <ui3n-progress-circular
          size="40"
          with-text
          :value="appProcessToDisplay.progressValue"
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
