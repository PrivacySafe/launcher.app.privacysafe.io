<script lang="ts" setup>
import { useAppStore } from '@/store';
import { Ui3nButton, Ui3nRadio, Ui3nSwitch } from '@v1nt1248/3nclient-lib';
import { storeToRefs } from 'pinia';
import { AVAILABLE_THEMES, AVAILABLE_LANGS } from '@/constants';

const appStore = useAppStore();
const { updateAppConfig } = appStore;
const { colorTheme, lang } = storeToRefs(appStore);

function changeColorTheme(isDarkColorTheme: boolean) {
  updateAppConfig({
    colorTheme: isDarkColorTheme ? 'dark' : 'default',
  });
}

const emits = defineEmits<{
  (ev: 'close'): void;
}>();
</script>

<template>
  <section :class="$style.appSettings">
    <div :class="$style.toolbar">
      {{ $tr('app.settings.title') }}
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
      <div>
        <div :class="$style.row">
          <div :class="$style.rowHeader">
            {{ $tr('app.settings.visualisation') }}
          </div>
          <div :class="$style.rowBody">
            <div :class="$style.rowBodyLabel">
              {{ $tr('app.settings.label.theme') }}
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
        </div>

        <div :class="$style.row">
          <div :class="$style.rowHeader">
            {{ $tr('app.settings.account.settings') }}
          </div>
          <div :class="$style.rowBody">
            <div :class="$style.rowBodyLabel">
              {{ $tr('app.settings.label.language') }}
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

.row {
  position: relative;
  width: 100%;
  margin-bottom: var(--spacing-m);
}

.rowHeader {
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
  height: var(--spacing-l);
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
</style>
