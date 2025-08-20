<!--
 Copyright (C) 2024 - 2025 3NSoft Inc.

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
import { Ui3nButton, Ui3nRadio, Ui3nSwitch } from '@v1nt1248/3nclient-lib';
import { AVAILABLE_THEMES, AVAILABLE_LANGS } from '@/common/constants';
import { useSettings } from '@/common/composables/useSettings';

const emits = defineEmits<{
  (ev: 'close'): void;
}>();

const {
  $tr,
  colorTheme,
  lang,
  systemFoldersDisplaying,
  allowShowingDevtool,
  autoUpdate,
  customLogoSrc,
  changeColorTheme,
  changeSystemFoldersDisplaying,
  changeAllowShowingDevtool,
  toggleAutoUpdate,
  wipeDataFromDevice,
  addCustomLogo,
  removeCustomLogo
} = useSettings();
</script>

<template>
  <section :class="$style.appSettings">
    <div :class="$style.toolbar">
      {{ $tr('settings.title') }}
      <ui3n-button
        :class="$style.close"
        type="icon"
        color="transparent"
        icon="round-close"
        icon-size="24"
        icon-color="var(--color-icon-button-secondary-default)"
        @click="emits('close')"
      />
    </div>

    <div :class="$style.body">

      <!-- appearance section/block -->
      <div :class="$style.block">
        <div :class="$style.blockHeader">
          {{ $tr('settings.section.appearance') }}
        </div>

        <!-- theme -->
        <div :class="$style.rowBody">
          <div :class="$style.rowBodyLabel">
            {{ $tr('settings.label.theme') }}
          </div>

          <div :class="$style.rowBodyValue">
            <span>{{ $tr(AVAILABLE_THEMES.default.label) }}</span>
            <ui3n-switch
              size="16"
              :model-value="colorTheme === 'dark'"
              @change="changeColorTheme"
            />
            <span>{{ $tr(AVAILABLE_THEMES.dark.label) }}</span>
          </div>
        </div>

        <!-- languages -->
        <div :class="$style.rowBody">
          <div :class="$style.rowBodyLabel">
            {{ $tr('settings.label.language') }}
          </div>

          <div :class="$style.rowBodyValue">
            <ui3n-radio
              size="16"
              :checked-value="AVAILABLE_LANGS.en.value"
              :unchecked-value="AVAILABLE_LANGS.en.value"
              :disabled="true"
              :model-value="lang"
            >
              {{ AVAILABLE_LANGS[lang].label }}
            </ui3n-radio>
          </div>
        </div>

        <!-- custom logo -->
        <div :class="$style.rowBody">
          <div :class="$style.rowBodyLabel">
            {{ $tr('settings.label.custom-logo') }}
          </div>

          <div :class="$style.rowBodyValue">
            <ui3n-button
              v-if="!customLogoSrc"
              type="primary"
              icon="round-plus"
              @click="addCustomLogo"
            >
              {{ $tr('settings.custom-logo.btn.add-logo') }}
            </ui3n-button>

            <img
              v-if="!!customLogoSrc"
              :src="customLogoSrc"
              alt="logo"
              :class="$style.customLogo"
            />

            <ui3n-button
              v-if="!!customLogoSrc"
              type="secondary"
              icon="outline-delete"
              @click="removeCustomLogo"
            />
          </div>
        </div>
      </div>

      <!-- system section/block -->
      <div :class="$style.block">
        <div :class="$style.blockHeader">
          {{ $tr('settings.system') }}
        </div>

        <!-- autoupdates -->
        <div :class="$style.rowBody">
          <div :class="$style.rowBodyLabel">
            {{ $tr('settings.label.autoupdates') }}
          </div>

          <div :class="$style.rowBodyValue">
            <span>{{ $tr('settings.label.off') }}</span>
            <ui3n-switch
              size="16"
              :model-value="autoUpdate"
              @change="toggleAutoUpdate"
            />
            <span>{{ $tr('settings.label.on') }}</span>
          </div>
        </div>

        <!-- showing system folders -->
        <div :class="$style.rowBody">
          <div :class="$style.rowBodyLabel">
            {{ $tr('settings.label.system.folders') }}
          </div>

          <div :class="$style.rowBodyValue">
            <span>{{ $tr('settings.label.no') }}</span>

            <ui3n-switch
              size="16"
              :model-value="systemFoldersDisplaying"
              @change="changeSystemFoldersDisplaying"
            />

            <span>{{ $tr('settings.label.yes') }}</span>
          </div>
        </div>

        <!-- showing devtool -->
        <div :class="$style.rowBody">
          <div :class="$style.rowBodyLabel">
            {{ $tr('settings.label.showing.devtool') }}
          </div>

          <div :class="$style.rowBodyValue">
            <span>{{ $tr('settings.label.no') }}</span>

            <ui3n-switch
              size="16"
              :model-value="allowShowingDevtool"
              @change="changeAllowShowingDevtool"
            />

            <span>{{ $tr('settings.label.yes') }}</span>
          </div>
        </div>
      </div>

      <!-- Data section/block -->
      <div :class="$style.block">
        <div :class="$style.blockHeader">
          {{ $tr('system.data-removal.section') }}
        </div>
        <div :class="$style.rowBody">
          <ui3n-button
            type="tertiary"
            @click="wipeDataFromDevice"
          >
            {{ $tr('system.data-removal.wipe-from-device') }}
          </ui3n-button>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" module>
.appSettings {
  --app-settings-toolbar-height: var(--spacing-xxl);

  position: relative;
  width: 100%;
  height: 100%;
}

.toolbar {
  position: relative;
  width: 100%;
  height: var(--app-settings-toolbar-height);
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid var(--color-border-block-primary-default);
  border-bottom: 1px solid var(--color-border-block-primary-default);
  font-size: var(--font-14);
  font-weight: 500;
  line-height: var(--font-20);
  color: var(--color-text-control-primary-default);
  text-transform: capitalize;
}

.close {
  position: absolute;
  left: var(--spacing-ml);
  top: var(--spacing-s);
}

.body {
  position: relative;
  width: 100%;
  height: calc(100% - var(--app-settings-toolbar-height));
  overflow-y: auto;
  padding: var(--spacing-m);
}

.block {
  position: relative;
  width: 100%;
  margin-bottom: var(--spacing-m);
}

.blockHeader {
  display: flex;
  width: 100%;
  height: var(--spacing-ml);
  justify-content: center;
  align-items: center;
  font-size: var(--font-12);
  font-weight: 500;
  line-height: var(--font-20);
  color: var(--color-text-block-primary-default);
  text-transform: capitalize;
}

.rowBody {
  display: flex;
  width: 100%;
  height: var(--spacing-xl);
  padding: 0 var(--spacing-m);
  justify-content: space-between;
  align-items: center;
}

.rowBodyLabel {
  font-size: var(--font-14);
  font-weight: 500;
  line-height: var(--font-20);
  color: var(--color-text-control-primary-default);
  text-transform: capitalize;
}

.rowBodyValue {
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

.customLogo {
  max-height: var(--spacing-l);
}
</style>
