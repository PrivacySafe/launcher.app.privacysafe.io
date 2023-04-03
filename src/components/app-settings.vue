<script lang="ts" setup>
  import { onMounted, ref} from 'vue'
  import { useRouter } from 'vue-router'
  import { appSetupMenu } from '@/constants'
  import { settingsService } from '@/services/index'
  import { Icon } from '@iconify/vue'

  const router = useRouter()

  const fs = ref<web3n.files.WritableFS|undefined>(undefined)
  const settings = ref<AppSettings|undefined>(undefined)
  const selectedSettingsItem = ref<AppSettingsMenuItem<'language'|'theme'>>(appSetupMenu['0'])

  const goBack = () => router.push('/control')

  const isValueSelected = (item: AppSettingsMenuItemValue<'language'|'theme'>): boolean => {
    const { currentConfig = {} as SetupFileData } = settings.value || {} as AppSettings
    const { language = 'en', theme = 'default' } = currentConfig
    return item.section === 'language'
      ? item.code === language
      : item.code === theme
  }

  const selectSettingsData = async (item: AppSettingsMenuItemValue<'language'|'theme'>): Promise<void> => {
    settings.value!.currentConfig[item.section] = item.code
    settings.value!.lastReceiveMessageTS = Date.now()
    await settingsService.saveSettingsFile(settings.value!)
  }

  onMounted(async () => {
    fs.value = await (w3n.storage as web3n.storage.Service).getAppLocalFS()
    settings.value = await settingsService.getSettingsFile()
  })
</script>

<template>
  <div class="app-settings">
    <div class="app-settings__fields">
      <div class="app-settings__body">
        <div
          v-for="field in appSetupMenu"
          :key="field.id"
          :class="[
            'app-settings__fields-item',
            { 'app-settings__fields-item--selected': field.id === selectedSettingsItem.id },
          ]"
          @click="() => selectedSettingsItem = field"
        >
          <icon
            :icon="field.icon"
            :width="16"
            :height="16"
            class="app-settings__fields-icon"
          />
          {{ field.sectionTitle }}
        </div>
      </div>
      <div class="app-settings__action">
        <var-button
          text
          text-color="#0090ec"
          class="app-settings__back-btn"
          @click="goBack"
        >
          Back
        </var-button>
      </div>
    </div>

    <div class="app-settings__content">
      <h4 class="app-settings__content-title">
        {{ selectedSettingsItem.sectionValueTitle }}:
      </h4>
      <div
        v-for="sectionItem in selectedSettingsItem.value"
        :key="sectionItem.code"
        :class="[
          'app-settings__content-item',
          {
            'app-settings__content-item--selected': isValueSelected(sectionItem),
            'app-settings__content-item--disabled': sectionItem.disabled,
          },
        ]"
        v-on="
          (isValueSelected(sectionItem) && !!sectionItem.disabled)
            ? {}
            : { 'click': () => selectSettingsData(sectionItem) }
        "
      >
        {{ sectionItem.name }}
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .app-settings {
    display: flex;
    width: 100%;
    height: 100%;
    border-radius: 16px;
    justify-content: space-between;
    align-items: stretch;
    background-color: var(--system-white, #fff);

    &__fields,
    &__content {
      position: relative;
      width: 50%;
      padding: 16px 0;
    }

    &__fields {
      background-color: var(--gray-50, #f2f2f2);

      &-item {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding: 0 16px;
        width: 100%;
        height: 32px;
        font-size: 14px;
        font-weight: 400;
        color: var(--black-90, #212121);

        &--selected {
          background-color: var(--system-white, #fff);
          padding-left: 12px;
          border-left: 4px solid var(--blue-main, #0090ec);
          color: var(--blue-main, #0090ec);

          .app-settings__fields-icon {
            color: var(--blue-main, #0090ec);
          }
        }

        &:hover {
          cursor: pointer;
          color: var(--blue-main, #0090ec);

          .app-settings__fields-icon {
            color: var(--blue-main, #0090ec);
          }
        }
      }

      &-icon {
        margin-right: 16px;
        color: var(--black-30, #b3b3b3);
      }
    }

    &__body {
      position: relative;
      width: 100%;
      height: calc(100% - 48px);
    }

    &__action {
      padding-top: 16px;
      text-align: center;
    }

    &__content {
      &-title {
        padding-left: 16px;
        font-size: 14px;
        line-height: 1.35;
        font-weight: 500;
        color: var(--black-90, #212121);
        margin: 0 0 8px;
      }

      &-item {
        position: relative;
        width: 100%;
        height: 32px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding-left: 16px;
        font-size: 14px;
        font-weight: 400;
        color: var(--black-90, #212121);

        &:hover:not(.app-settings__content-item--selected) {
          cursor: pointer;
          color: var(--system-black, #000);
        }

        &--selected {
          background-color: var(--blue-main-30, #b0dafc);
        }

        &--disabled {
          opacity: 0.5;
          cursor: default;
          pointer-events: none;
        }
      }
    }

    &__back-btn {
      --button-normal-height: 32px;
      --font-size-md: 12px;

      .var-button__content {
        font-weight: 500;
      }
    }
  }
</style>
