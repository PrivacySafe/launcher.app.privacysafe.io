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
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { Ui3nButton, Ui3nMenu, Ui3nTabs, Ui3nRipple } from '@v1nt1248/3nclient-lib';
import { initializationServices } from '@/services';
import { useAppStore } from '@/store';
import { mainTabs } from './constants';
import prLogo from '@/assets/images/privacysafe-logo.svg';
import ContactIcon from '@/components/contact-icon.vue';
import AppSettings from '@/components/app-settings.vue';
import Applications from '@/views/applications/applications.vue';
import Updates from '@/views/updates/updates.vue';

const vUi3nRipple = Ui3nRipple;

const appStore = useAppStore();
const { user, connectivityStatus } = storeToRefs(appStore);
const { getAppConfig, getUser, getConnectivityStatus } = appStore;

const currentTab = ref(0);
const connectivityTimerId = ref<ReturnType<typeof setInterval> | undefined>();
const isSettingsShow = ref(false);

const connectivityStatusText = computed(() =>
  connectivityStatus.value === 'online' ? 'app.status.connected.online' : 'app.status.connected.offline',
);

const appVersion = ref('');
w3n.myVersion().then(v => {
  appVersion.value = v;
});

async function appExit() {
  w3n.closeSelf!();
}

onBeforeMount(async () => {
  try {
    await Promise.all([
      initializationServices(),

      getUser(),
      getAppConfig(),
      getConnectivityStatus()
    ]);

    connectivityTimerId.value = setInterval(getConnectivityStatus, 60000);
  } catch (e) {
    console.error('MOUNTED ERROR: ', e);
    throw e;
  }
});

onBeforeUnmount(() => {
  if (connectivityTimerId.value) {
    clearInterval(connectivityTimerId.value);
  }
});
</script>

<template>
  <div :class="$style.app">
    <div :class="$style.toolbar">
      <div :class="$style.toolbarTitle">
        <img
          :src="prLogo"
          alt="logo"
          :class="$style.toolbarLogo"
        />
        <div :class="$style.delimiter">/</div>
        <div :class="$style.info">
          {{ $tr('app.title') }}
          <div :class="$style.version"> {{ $tr('app.version.abbrev') }} {{ appVersion }}</div>
        </div>
      </div>

      <div :class="$style.user">
        <div :class="$style.userInfo">
          <span :class="$style.mail">
            {{ user }}
          </span>
          <span :class="$style.connection">
            {{ $tr('app.status') }}:
            <span :class="connectivityStatusText === 'app.status.connected.online' && $style.connectivity">
              {{ $tr(connectivityStatusText) }}
            </span>
          </span>
        </div>

        <ui3n-menu
          position-strategy="fixed"
          :offset-y="4"
        >
          <div
            v-ui3n-ripple
            :class="$style.icon"
          >
            <contact-icon
              :name="user"
              :size="36"
              :readonly="true"
            />
          </div>

          <template #menu>
            <div :class="$style.menu">
              <div
                :class="$style.menuItem"
                @click="appExit"
              >
                {{ $tr('app.exit') }}
              </div>
            </div>
          </template>
        </ui3n-menu>
      </div>
    </div>

    <div :class="$style.tabsWrapper">
      <ui3n-tabs v-model="currentTab">
        <div
          v-for="(tab, index) in mainTabs"
          :key="index"
          :class="$style.tab"
        >
          {{ $tr(tab.label) }}
        </div>
      </ui3n-tabs>

      <ui3n-button
        :class="$style.settingsBtn"
        type="custom"
        color="var(--color-bg-button-tritery-default)"
        icon="outline-settings"
        icon-size="24"
        icon-color="var(--color-icon-button-tritery-default)"
        @click="isSettingsShow = true"
      />
    </div>

    <div :class="$style.content">
      <transition mode="out-in">
        <applications v-if="currentTab === 0" />
        <updates v-else />
      </transition>
    </div>

    <transition
      name="set"
      mode="out-in"
    >
      <section
        v-if="isSettingsShow"
        :class="[$style.settings, isSettingsShow && $style.settingsOpened]"
      >
        <app-settings @close="isSettingsShow = false" />
      </section>
    </transition>

    <div id="notification" />
  </div>
</template>

<style lang="scss" module>
@import '../../assets/styles/mixins';

.app {
  --main-toolbar-height: 72px;
  --main-tabs-height: 48px;

  position: fixed;
  inset: 0;
  background-size: cover;
}

.toolbar {
  position: relative;
  width: 100%;
  height: var(--main-toolbar-height);
  padding: 0 var(--spacing-m);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border-block-primary-default);
}

.toolbarTitle {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.toolbarLogo {
  position: relative;
  top: -2px;
  margin-right: var(--spacing-m);
}

.delimiter {
  font-size: 20px;
  font-weight: 500;
  color: var(--color-text-control-accent-default);
  margin-right: var(--spacing-m);
  padding-bottom: 2px;
}

.info {
  position: relative;
  width: max-content;
  font-size: var(--font-16);
  font-weight: 500;
  color: var(--color-text-control-primary-default);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: var(--spacing-s);
  padding-bottom: calc(var(--spacing-xs) / 2);
}

.version {
  font-size: var(--font-16);
  font-weight: 500;
  color: var(--color-text-control-secondary-default);
  line-height: var(--font-16);
}

.user {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.userInfo {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  margin-right: var(--spacing-m);

  span:not(.connectivity) {
    color: var(--color-text-control-primary-default);
    line-height: 1.4;
  }
}

.mail {
  font-size: var(--font-14);
  font-weight: 600;
}

.connection {
  font-size: var(--font-12);
  font-weight: 500;
}

.connectivity {
  color: var(--success-content-default);
}

.icon {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: 50%;
}

.menu {
  position: relative;
  background-color: var(--color-bg-control-secondary-default);
  width: max-content;
  border-radius: var(--spacing-xs);
  @include elevation(1);
}

.menuItem {
  position: relative;
  width: 60px;
  height: var(--spacing-l);
  padding: 0 var(--spacing-s);
  font-size: var(--font-13);
  font-weight: 500;
  color: var(--color-text-control-primary-default);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;

  &:hover {
    background-color: var(--color-bg-control-primary-hover);
    color: var(--color-text-control-accent-default);
  }
}

.tabsWrapper {
  display: flex;
  width: 100%;
  height: var(--main-tabs-height);
  padding: 0 var(--spacing-m);
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--color-border-block-primary-default);
}

.tab {
  position: relative;
  height: var(--main-tabs-height);
  width: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: var(--font-14);
  font-weight: 500;
}

.settingsBtn {
  gap: 0 !important;
  padding-left: var(--spacing-s) !important;
  position: absolute;
  left: var(--spacing-m);
}

.content {
  position: fixed;
  inset: calc(var(--main-toolbar-height) + var(--main-tabs-height) + 1px) 0 0 0;
  bottom: 0;
}

.settings {
  position: absolute;
  z-index: 5;
  width: 100%;
  height: calc(100% - var(--main-toolbar-height));
  background-color: var(--color-bg-block-primary-default);
  top: 100%;
}

.settingsOpened {
  top: var(--main-toolbar-height);
}

#notification {
  position: fixed;
  bottom: var(--spacing-xs);
  left: var(--spacing-m);
  right: var(--spacing-m);
  z-index: 5000;
  height: auto;
  display: flex;
  justify-content: center;
  align-content: flex-end;
}
</style>
