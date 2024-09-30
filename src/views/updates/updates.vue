<script lang="ts" setup>
import { computed, inject, onBeforeMount, onBeforeUnmount, ref } from 'vue';
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
import { Ui3nInput, Ui3nProgressCircular } from '@v1nt1248/3nclient-lib';
import { useAppStore } from '@/store';
import ApplicationView from '@/components/application-view.vue';
import type { GlobalEvents } from '@/types';

const { $tr } = inject<I18nPlugin>(I18N_KEY)!;
const { $emitter } = inject<VueBusPlugin<GlobalEvents>>(VUEBUS_KEY)!;
const { $createNotice } = inject<NotificationsPlugin>(NOTIFICATIONS_KEY)!;
const appStore = useAppStore();
const { prepareAppListForInstallAndUpdate } = appStore;
const { applicationsForInstallAndUpdate, installedApplications } = storeToRefs(appStore);

const isLoading = ref(false);
const search = ref('');

const filteredApplicationsForInstallAndUpdate = computed(() => applicationsForInstallAndUpdate.value.filter(a => {
  if (!search.value.trim()) return true;

  const { manifest } = a;
  if (!manifest) return applicationsForInstallAndUpdate.value;

  const { name = '' } = manifest;
  return name.toLowerCase().includes(search.value.trim().toLowerCase());
}));

async function loadData() {
  try {
    isLoading.value = true;
    await prepareAppListForInstallAndUpdate();
  } catch (err) {
    console.error('The load information update applications error. ', err);
    $createNotice({
      type: 'warning',
      content: $tr('app.update.load.info.error'),
    });
  }

  finally {
    isLoading.value = false;
  }
}

$emitter.on('install:complete:next', loadData);

onBeforeMount(async () => {
  await loadData()
});

onBeforeUnmount(() => {
  $emitter.off('install:complete:next', loadData);
});
</script>

<template>
  <section :class="$style.updates">
    <div :class="$style.search">
      <ui3n-input
        v-model="search"
        :placeholder="$tr('app.update.search.placeholder')"
        clearable
        icon="search"
        autofocus
      />
    </div>

    <div :class="$style.content">
      <div
        v-if="isEmpty(filteredApplicationsForInstallAndUpdate)"
        :class="$style.empty"
      >
        {{ $tr('app.list.empty') }}
      </div>

      <template v-else>
        <application-view
          v-for="app in filteredApplicationsForInstallAndUpdate"
          :key="app.id"
          block="update"
          :installed-apps="installedApplications"
          :application="app"
        />
      </template>
    </div>

    <div
      v-if="isLoading"
      :class="$style.loading"
    >
      <ui3n-progress-circular indeterminate size="64" />
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
