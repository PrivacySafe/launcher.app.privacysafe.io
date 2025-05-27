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
import { computed, inject, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { isEmpty } from 'lodash';
import { I18N_KEY, I18nPlugin } from '@v1nt1248/3nclient-lib/plugins';
import { Ui3nInput } from '@v1nt1248/3nclient-lib';
import { useAppsStore } from '@/common/store/apps.store';
import AppView from '@/desktop/components/app-view.vue';
import PlatformView from '@/desktop/components/platform-view.vue';

const { $tr } = inject<I18nPlugin>(I18N_KEY)!;
const { applicationsInSystem } = storeToRefs(useAppsStore());

const search = ref('');

const filteredApps = computed(() => applicationsInSystem.value
  .filter(({ name }) => {
    const searchStr = search.value.trim().toLowerCase();
    return name.toLowerCase().includes(searchStr);
  }),
);
</script>

<template>
  <section :class="$style.updates">
    <div :class="$style.search">
      <ui3n-input
        v-model="search"
        :placeholder="$tr('app.update.search.placeholder')"
        clearable
        icon="round-search"
        autofocus
      />
    </div>

    <div :class="$style.content">
      <platform-view />

      <div
        v-if="isEmpty(filteredApps)"
        :class="$style.empty"
      >
        {{ $tr('app.list.empty') }}
      </div>

      <template v-else>
        <app-view
          v-for="app in filteredApps"
          :key="app.appId"
          :app-info="app"
        />
      </template>
    </div>
  </section>
</template>

<style lang="scss" module>
.updates {
  position: relative;
  width: 100%;
  height: 100%;
  padding: var(--spacing-m);
}

.search {
  position: relative;
  width: 100%;
  margin: var(--spacing-s) 0 var(--spacing-ml);
}

.content {
  position: relative;
  width: 100%;
  height: calc(100% - var(--spacing-ml) - var(--spacing-s) - var(--spacing-xxl));
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
