<script lang="ts" setup>
import { inject, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { isEmpty } from 'lodash';
import {
  I18N_KEY,
  I18nPlugin,
  NOTIFICATIONS_KEY,
  NotificationsPlugin,
  VUEBUS_KEY,
  VueBusPlugin,
} from '@v1nt1248/3nclient-lib/plugins';
import { useAppStore } from '@/store';
import ApplicationView from '@/components/application-view.vue';
import { Ui3nProgressCircular } from '@v1nt1248/3nclient-lib';
import type { GlobalEvents } from '@/types';

const { $emitter } = inject<VueBusPlugin<GlobalEvents>>(VUEBUS_KEY)!;
const { $createNotice } = inject<NotificationsPlugin>(NOTIFICATIONS_KEY)!;
const { $tr } = inject<I18nPlugin>(I18N_KEY)!;

const appStore = useAppStore();
const { getInstalledApplications } = appStore;
const { installedApplications } = storeToRefs(appStore);

const isLoading = ref(false);

$emitter.on('install:complete', loadInstalledApplicationsInfo);

async function loadInstalledApplicationsInfo() {
  try {
    isLoading.value = true;
    await getInstalledApplications();
  } catch (err) {
    console.error('The load information installed applications error.', err);
    $createNotice({
      type: 'warning',
      content: $tr('app.installed.load.info.error'),
    });
  } finally {
    isLoading.value = false;
  }
}

async function loadInstalledApplicationsInfoAfterInstall() {
  await loadInstalledApplicationsInfo();
  $emitter.emit('install:complete:next', null);
}

onBeforeMount(async () => {
  await loadInstalledApplicationsInfo();
});

onBeforeUnmount(() => {
  $emitter.off('install:complete', loadInstalledApplicationsInfoAfterInstall);
});
</script>

<template>
  <section :class="$style.applications">
    <div
      v-if="isEmpty(installedApplications)"
      :class="$style.empty"
    >
      {{ $tr('app.list.empty') }}
    </div>

    <template v-else>
      <application-view
        v-for="app in installedApplications"
        :key="app.id"
        :application="app"
      />
    </template>

    <div
      v-if="isLoading"
      :class="$style.loading"
    >
      <ui3n-progress-circular indeterminate size="64" />
    </div>
  </section>
</template>

<style lang="scss" module>
.applications {
  position: relative;
  width: 100%;
  height: 100%;
  padding: var(--spacing-m);
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
