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
import { storeToRefs } from 'pinia';
import { get } from 'lodash';
import { Ui3nButton, Ui3nProgressCircular } from '@v1nt1248/3nclient-lib';
import { useProcessStore } from '@/store';
import { AppLaunchers, Launcher } from '@/types';
import AppIcon from './app-icon.vue';
import ApplicationItemArea from './application-item-area.vue';

const props = defineProps<{
  launchers: AppLaunchers;
}>();
const appId = props.launchers.appId;

const processStore = useProcessStore();
const { processes } = storeToRefs(processStore);

const currentProcess = computed(() => get(processes.value, [ appId ]));

async function startLauncher(l: Launcher) {
  if (l.component) {
    await w3n.system!.apps!.opener!.openApp(
      appId, l.component
    );
  } else if (l.startCmd) {
    await w3n.system!.apps!.opener!.executeCommand(appId, l.startCmd);
  } else {
    throw new Error(`Malformed launcher: neither component, nor command found`);
  }
}

</script>

<template>
  <application-item-area>
    <template #main>
      <app-icon
        :iconBytes=launchers.iconBytes
      />

      <div :class="$style.content">
        <div :class="$style.name">
          {{ launchers.name }}
        </div>

        <div :class="$style.version">
          v {{ launchers.version }}
        </div>
      </div>

      <div :class="$style.action"
        v-if="!!launchers.defaultLauncher"
      >
        <ui3n-button
          :class="$style.btn"
          block
          @click="startLauncher(launchers.defaultLauncher)"
        >
          {{ $tr('app.action.open') }}
        </ui3n-button>
      </div>
    </template>

    <template #other>

      <!-- <template v-if="block === 'update'">
        <div :class="$style.description">
          <span v-if="descriptionTitle">{{ descriptionTitle }}</span>
          <span v-if="description">{{ description }}</span>
          <span v-if="launchers.id" :class="$style.accented">{{ launchers.id }}</span>
        </div>
      </template>

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
      </div> -->
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
</style>
