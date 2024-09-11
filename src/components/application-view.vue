<script lang="ts" setup>
import { computed, inject, onBeforeUnmount } from 'vue';
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
import { Ui3nButton, Ui3nIcon, Ui3nProgressCircular } from '@v1nt1248/3nclient-lib';
import { useProcessStore } from '@/store';
import { AppView } from '@/types';

const props = withDefaults(
  defineProps<{
    application: AppView;
    block?: 'installed' | 'update',
    installedApps?: AppView[];
  }>(),
  {
    block: 'installed',
    installedApps: () => [],
  },
);

const { $emitter } = inject<VueBusPlugin>(VUEBUS_KEY)!;
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

const canInstall = computed(() => props.block === 'update' && !isAppInstalled.value);

const actionBtn = computed(() => {
  if (props.block === 'installed') return $tr('app.action.open');

  return canInstall.value ? $tr('app.action.install') : $tr('app.action.update');
});

const iconFile = computed(() => get(props.application, ['manifest', 'launchOnSystemStartup', '0', 'iconFile']));

const url = computed(() => {
  if (!iconFile.value) return '';

  const arr = new Uint8Array(iconFile.value);
  const blob = new Blob([arr], { type: 'image/png' });
  return window.URL.createObjectURL(blob);
});

const descriptionTitle = computed(() => get(props.application, ['manifest', 'launchOnSystemStartup', '0', 'name']) || get(props.application, ['manifest', 'name']));

const description = computed(() => get(props.application, ['manifest', 'launchOnSystemStartup', '0', 'description']));

const actionBtnBgColor = computed(() => {
  if (
    props.block === 'installed' ||
    (props.block === 'update' && isAppInstalled.value)
  ) return 'var(--color-bg-button-secondary-default)';

  return 'var(--color-bg-button-primary-default)';
});

const actionBtnTextColor = computed(() => {
  if (
    props.block === 'installed' ||
    (props.block === 'update' && isAppInstalled.value)
  ) return 'var(--color-text-button-secondary-default)';

  return 'var(--color-text-button-primary-default)';
});

const actionBtnDisable = computed(() => {
  if (props.block === 'installed' || (props.block === 'update' && !isAppInstalled.value)) return false;

  const installedApp = props.installedApps.find(a => a.id === props.application.id);
  return !installedApp ? false : installedApp.current === props.application.current;
});

function openApp() {
  w3n.apps?.opener?.openApp(props.application.id);
}

async function installApp() {
  try {
    upsertProcess(props.application.id, { process: 'installing' });
    await w3n.apps?.installer?.installApp(props.application.id, props.application.current!);
    $createNotice({
      type: 'success',
      content: $tr('app.install.success', { name: props.application.manifest?.name || '' }),
    });
    $emitter.emit('install:complete');
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
  w3n.apps?.downloader?.downloadWebApp(
    props.application.id,
    props.application.current!,
    {
      next: (progress: web3n.apps.DownloadProgress) => {
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

function onActionBtnClick() {
  if (props.block === 'installed') {
    openApp();
    return;
  }

  installAndUpdate();
}

onBeforeUnmount(() => {
  url.value && window.URL.revokeObjectURL(url.value);
});
</script>

<template>
  <div :class="$style.applicationView">
    <div :class="$style.main">
      <div :class="$style.iconWrapper">
        <img v-if="iconFile" :src="url" alt="icon" width="16" height="16" />

        <ui3n-icon
          v-else
          icon="round-info"
          width="12"
          height="12"
          color="var(--grey-50)"
        />
      </div>

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
          @click="onActionBtnClick"
        >
          {{ actionBtn }}
        </ui3n-button>
      </div>
    </div>

    <template v-if="block === 'update'">
      <div :class="$style.description">
        <span v-if="descriptionTitle">{{ descriptionTitle }}</span>
        <span v-if="description">{{ description }}</span>
        <span v-if="application.id" :class="$style.accented">{{ application.id }}</span>
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
    </div>
  </div>
</template>

<style lang="scss" module>
.applicationView {
  --action-block-witdh: calc(3 * var(--spacing-ml));

  position: relative;
  width: 100%;
  border-radius: var(--spacing-s);
  padding: var(--spacing-s) var(--spacing-m);
  background-color: var(--color-bg-control-secondary-default);
  margin-bottom: var(--spacing-s);
}

.main {
  position: relative;
  width: 100%;
  min-height: var(--spacing-l);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: var(--spacing-s);
}

.iconWrapper {
  position: relative;
  width: var(--spacing-ml);
  min-width: var(--spacing-ml);
  height: var(--spacing-ml);
  min-height: var(--spacing-ml);
  border-radius: 50%;
  background-color: var(--grey-15);
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    border-radius: 50%;
  }
}

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
  width: var(--action-block-witdh);

  .btn {
    text-transform: capitalize;
  }
}

.description {
  position: relative;
  width: calc(100% - var(--action-block-witdh) - var(--spacing-s));
  margin-top: var(--spacing-s);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: var(--spacing-xs);
  font-size: var(--font-12);
  font-weight: 400;
  line-height: var(--font-16);
  color: var(--color-test-block-primary-default);
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
