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
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Ui3nButton } from '@v1nt1248/3nclient-lib';
import { useAppPage } from '@/common/composables/useAppPage';
import AppMenu from '@/mobile/components/app-menu/app-menu.vue';
import { APP_MENU_DATA } from '@/mobile/components/app-menu/constants';

const route = useRoute();

const {
  user,
  connectivityStatusText,
  doBeforeMount,
  doBeforeUnmount
} = useAppPage();

const isMenuOpen = ref(false);

const currentMenuItem = computed(() => {
  return APP_MENU_DATA.find(i => i.routeName === route.name);
});

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

onBeforeMount(doBeforeMount);
onBeforeUnmount(doBeforeUnmount);

</script>

<template>
  <div :class="$style.app">
    <transition name="slide-fade">
      <div
        v-if="isMenuOpen"
        :class="$style.menu"
      >
        <app-menu
          :user="user"
          :connectivity-status-text="connectivityStatusText"
          @close="isMenuOpen = false"
        />
      </div>
    </transition>

    <div :class="[$style.body, isMenuOpen && $style.bodyDisabled]">
      <div :class="$style.toolbar">
        <transition>
          <ui3n-button
            type="icon"
            :color="isMenuOpen ? 'transparent' : 'var(--color-bg-block-primary-default)'"
            :icon="isMenuOpen ? 'round-close' : 'round-menu'"
            :icon-color="isMenuOpen ? 'var(--color-icon-block-secondary-default)' : 'var(--color-icon-block-primary-default)'"
            icon-size="20"
            @click="toggleMenu"
          />
        </transition>

        <div :class="$style.item">
          <span :class="$style.itemName">{{ currentMenuItem?.name }}</span>
        </div>

        <span />
      </div>

      <div :class="$style.content">
        <router-view v-slot="{ Component }">
          <transition>
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>

    <div id="notification" />
  </div>
</template>

<style lang="scss" module>
@use '@/common/assets/styles/_mixins' as mixins;

.app {
  --main-toolbar-height: 48px;

  position: fixed;
  inset: 0;
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  overflow: hidden;
}

.menu {
  position: relative;
  min-width: 80%;
  width: 80%;
  height: 100%;
  z-index: 1;
}

.body {
  position: relative;
  min-width: 100%;
  width: 100%;
  height: 100%;

  &.bodyDisabled {
    background-color: var(--files-darker);

    .toolbar {
      border-bottom: none !important;
      background-color: var(--files-darker);
    }

    .content {
      pointer-events: none;

      &::after {
        position: absolute;
        content: '';
        inset: 0;
        z-index: 5;
        background-color: var(--files-darker);
      }
    }
  }
}

.toolbar {
  position: relative;
  width: 100%;
  height: var(--main-toolbar-height);
  padding: 0 var(--spacing-xl) 0 var(--spacing-s);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border-block-primary-default);
  background-color: var(--color-bg-block-primary-default);
}

.item {
  display: flex;
  justify-content: center;
  align-items: center;
  column-gap: var(--spacing-s);
}

.itemName {
  font-size: var(--font-16);
  font-weight: 700;
  color: var(--color-text-block-primary-default);
}

.content {
  position: relative;
  width: 100%;
  height: calc(100% - var(--main-toolbar-height) - 1px);
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

<style lang="scss">
.slide-fade-enter-active {
  transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}
</style>
