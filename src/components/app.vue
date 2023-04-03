<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  import { settingsService } from '@/services'
  import { setColorTheme } from '@/helpers/forUI'

  const fs = ref<web3n.files.WritableFS|undefined>(undefined)

  onMounted(async () => {
    fs.value = await (w3n.storage as web3n.storage.Service).getAppLocalFS()
    const { currentTheme, colors } = await settingsService.getCurrentColorTheme()
    setColorTheme({
      theme: currentTheme || 'default',
      colors,
    })
  })
</script>

<template>
  <div
    id="main"
    class="main"
  >
    <div class="main__content">
      <router-view v-slot="{ Component }">
        <transition>
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<style lang="scss">
  .main {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-size: cover;
    display: flex;

    &__content {
      position: relative;
      background-color: white;
    }
  }
</style>
