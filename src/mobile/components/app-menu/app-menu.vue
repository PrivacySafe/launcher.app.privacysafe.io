<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router';
import { Ui3nIcon } from '@v1nt1248/3nclient-lib';
import { APP_MENU_DATA, type AppMenuItem } from './constants';
import ContactIcon from '@/common/components/contact-icon.vue';

defineProps<{
  user: string;
  connectivityStatusText: string;
}>();
const emits = defineEmits<{
  (event: 'close'): void;
}>();

const route = useRoute();
const router = useRouter();

function isMenuItemSelected(item: AppMenuItem) {
  return route.name === item.routeName;
}

async function goToMenuItem(item: AppMenuItem) {
  await router.push({ name: item.routeName });
  emits('close');
}
</script>

<template>
  <div :class="$style.appMenu">
    <div :class="$style.appMenuHeader">
      <contact-icon
        :size="32"
        :name="user"
        readonly
      />

      <div :class="$style.info">
        <div :class="$style.user">
          {{ user }}
        </div>

        <div :class="$style.status">
          {{ $tr('app.status') }}: {{ $tr(connectivityStatusText) }}
        </div>
      </div>
    </div>

    <div :class="$style.appMenuBody">
      <template
        v-for="menuItem in APP_MENU_DATA"
        :key="menuItem.id"
      >
        <div
          tabindex="1"
          :class="[$style.menuItem, isMenuItemSelected(menuItem) && $style.menuItemSelected]"
          @click="goToMenuItem(menuItem)"
        >
          <ui3n-icon
            :class="$style.menuItemIcon"
            :icon="menuItem.icon || ''"
            color="var(--color-icon-control-secondary-default)"
          />

          <span :class="$style.menuItemName">{{ menuItem.name }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" module>
@use '@/common/assets/styles/_mixins' as mixins;

.appMenu {
  --app-menu-header-heigh: 48px;

  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--color-bg-block-primary-default);
}

.appMenuHeader {
  display: flex;
  width: 100%;
  height: var(--app-menu-header-heigh);
  padding-left: var(--spacing-s);
  justify-content: flex-start;
  align-items: center;
  column-gap: var(--spacing-s);
}

.info {
  position: relative;
  width: calc(100% - 44px);
  color: var(--color-text-control-primary-default);
}

.user {
  font-size: var(--font-14);
  font-weight: 700;
  line-height: var(--font-16);
  @include mixins.text-overflow-ellipsis();
}

.status {
  font-size: var(--font-12);
  font-weight: 600;
  line-height: var(--font-14);
}

.appMenuBody {
  position: relative;
  width: 100%;
  height: calc(100% - var(--app-menu-header-heigh));
  overflow-x: hidden;
  overflow-y: auto;
  padding: var(--spacing-m) 0 64px;
}

.menuItem {
  position: relative;
  display: flex;
  width: calc(100% - var(--spacing-m));
  height: 36px;
  border-radius: var(--spacing-s);
  justify-content: space-between;
  align-items: center;
  column-gap: var(--spacing-s);
  padding: 0 var(--spacing-s) 0 var(--spacing-l);
  cursor: pointer;
  margin: 0 var(--spacing-s) var(--spacing-xs) var(--spacing-s);

  .menuItemIcon {
    position: absolute;
    left: var(--spacing-s);
    top: 10px;
  }

  .menuItemName {
    font-size: var(--font-13);
    font-weight: 600;
    line-height: var(--font-16);
    color: var(--color-text-control-primary-default);
  }

  &.menuItemSelected {
    background-color: var(--color-bg-control-primary-hover);

    & > div {
      color: var(--color-icon-control-accent-default) !important;
    }
  }
}
</style>
