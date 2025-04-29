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
import { Ui3nIcon } from '@v1nt1248/3nclient-lib';
import { computed, onBeforeUnmount } from 'vue';

const props = defineProps<{
  iconBytes?: Uint8Array;
}>();

const url = computed(() => {
  if (!props.iconBytes) return '';
  const blob = new Blob([props.iconBytes], { type: 'image/png' });
  return window.URL.createObjectURL(blob);
});

onBeforeUnmount(() => {
  url.value && window.URL.revokeObjectURL(url.value);
});
</script>

<template>
  <div :class="$style.iconWrapper">
    <img v-if="iconBytes" :src="url" alt="icon" width="32" height="32" />

    <ui3n-icon
      v-else
      icon="round-info"
      width="32"
      height="32"
      color="var(--grey-50)"
    />
  </div>
</template>

<style lang="scss" module>
.iconWrapper {
  position: relative;
  width: var(--spacing-l);
  min-width: var(--spacing-l);
  height: var(--spacing-l);
  min-height: var(--spacing-l);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
