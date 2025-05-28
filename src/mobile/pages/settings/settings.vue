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
  import { Ui3nRadio, Ui3nSwitch } from '@v1nt1248/3nclient-lib';
  import { AVAILABLE_THEMES, AVAILABLE_LANGS } from '@/common/constants';
  import { useSettings } from '@/common/composables/useSettings';

  const {
    $tr,
    colorTheme,
    lang,
    autoUpdate,
    changeColorTheme,
    toggleAutoUpdate,
  } = useSettings();

  function _changeColorTheme(isDarkColorTheme: boolean) {
    const newColorTheme = isDarkColorTheme ? 'dark' : 'light';
    if (colorTheme.value !== newColorTheme) {
      changeColorTheme(isDarkColorTheme);
    }
  }

  function changeAutoUpdate(value: boolean) {
    toggleAutoUpdate(value);
  }
</script>

<template>
  <div :class="$style.settings">
    <div :class="$style.block">
      <div :class="$style.title">
        {{ $tr('settings.section.appearance') }}
      </div>

      <div :class="$style.row">
        <h4 :class="$style.label">
          {{ $tr('settings.label.theme') }}
        </h4>

        <div :class="$style.value">
          <span
            :class="$style.pointer"
            @click="_changeColorTheme(false)"
          >
            {{ $tr(AVAILABLE_THEMES.default.label) }}
          </span>

          <ui3n-switch
            size="16"
            :model-value="colorTheme === 'dark'"
            @change="changeColorTheme"
          />

          <span
            :class="$style.pointer"
            @click="_changeColorTheme(true)"
          >
            {{ $tr(AVAILABLE_THEMES.dark.label) }}
          </span>
        </div>
      </div>
    </div>

    <div :class="$style.block">
      <div :class="$style.title">
        {{ $tr('settings.label.language') }}
      </div>

      <div :class="$style.row">
        <h4 :class="$style.label">
          {{ $tr('settings.label.language') }}
        </h4>

        <div :class="$style.value">
          <ui3n-radio
            size="20"
            :checked-value="AVAILABLE_LANGS.en.value"
            :unchecked-value="AVAILABLE_LANGS.en.value"
            :disabled="true"
            :model-value="lang"
          >
            {{ AVAILABLE_LANGS[lang].label }}
          </ui3n-radio>
        </div>
      </div>
    </div>

    <div :class="$style.block">
      <div :class="$style.title">
        {{ $tr('settings.updates') }}
      </div>

      <div :class="$style.row">
        <h4 :class="$style.label">
          {{ $tr('settings.label.autoupdates') }}
        </h4>

        <div :class="$style.value">
          <span
            :class="$style.pointer"
            @click="changeAutoUpdate(false)"
          >
            {{ $tr('settings.label.off') }}
          </span>

          <ui3n-switch
            size="16"
            :model-value="autoUpdate"
            @change="toggleAutoUpdate"
          />

          <span
            :class="$style.pointer"
            @click="changeAutoUpdate(true)"
          >
            {{ $tr('settings.label.on') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" module>
.settings {
  position: relative;
  width: 100%;
  height: 100%;
  padding: var(--spacing-m);
  overflow-x: hidden;
  overflow-y: auto;
  background-color: var(--color-bg-block-primary-default);
}

.block {
  position: relative;
  width: 100%;
  margin-bottom: var(--spacing-m);
}

.title {
  font-size: var(--font-14);
  font-weight: 600;
  line-height: var(--font-20);
  color: var(--color-text-block-primary-default);
  text-transform: capitalize;
  margin-bottom: var(--spacing-s);
}

.row {
  display: flex;
  width: 100%;
  height: var(--spacing-l);
  padding: 0 var(--spacing-s);
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: var(--font-12);
  font-weight: 500;
  line-height: var(--font-20);
  color: var(--color-text-control-primary-default);
  text-transform: capitalize;
  margin-bottom: var(--spacing-s);
}

.value {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-s);

  span {
    font-size: var(--font-12);
    font-weight: 500;
    color: var(--color-text-control-primary-default);
    text-transform: capitalize;
  }
}

.pointer {
  cursor: pointer;
}
</style>
