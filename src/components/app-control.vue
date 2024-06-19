<script lang="ts" setup>
  import { computed, onMounted, ref } from "vue"
  import { useRouter } from 'vue-router'
  import { Icon } from '@iconify/vue'
  import { getElementColor, invertColor, userNameFromUserId, userDomainFromUserId } from '@/helpers/forUI'
  import logo from '@/assets/images/logo.png'
  import { AppView, DynamicAppsList } from '@/state/apps'

  const router = useRouter()
  const user = ref<string>('')
  const initials = computed<string>(() => user.value
    ? user.value.slice(0, 2)
    : '?'
  )
  const userName = computed<string>(() => user.value
    ? userNameFromUserId(user.value)
    : ''
  )
  const userDomain = computed<string>(() => user.value
    ? userDomainFromUserId(user.value)
    : ''
  )
  const avatarBgColor = computed<string>(() => getElementColor(initials.value))
  const avatarColor = computed<string>(() => invertColor(avatarBgColor.value))

  const tmp = ref<AppView[]>([])
  const dynamicList = new DynamicAppsList(views => { tmp.value = views })
  const apps = computed<AppView[]>(() => tmp.value)

  onMounted(async () => {
    user.value = await w3n.mailerid!.getUserId()
    await dynamicList.checkAppsAndUpdateView()
  })

  const logout = async () => await w3n.logout!(true)
  const openInstaller = async () => await w3n!.shell!.startAppWithParams!(null, 'open-installer')
  const openSettings = () => {
    router.push('/settings')
  }
</script>

<template>
  <div class="app-control">
    <div class="app-control__sidebar">
      <img
        :src="logo"
        width="95"
        height="20"
        alt="logo"
        class="app-control__logo"
      >
      <div
        class="app-control__avatar"
        :style="{ 'background-color': avatarBgColor }"
      >
        <span :style="{ color: avatarColor }">{{ initials }}</span>
      </div>

      <span class="app-control__user">
        <span>{{ userName }}</span><span>{{ userDomain }}</span>
      </span>

      <div
        class="app-control__sidebar-action"
      >
        <var-button
          text
          text-color="#0090ec"
          class="app-control__sidebar-btn"
          @click="openSettings"
        >
          Settings
        </var-button>

        <var-button
          text
          text-color="#0090ec"
          class="app-control__sidebar-btn"
          @click="openInstaller"
        >
          Add & Update
        </var-button>

        <var-button
          text
          text-color="#0090ec"
          color="#fff"
          class="app-control__sidebar-btn"
          @click="logout"
        >
          Logout
        </var-button>
      </div>
    </div>

    <div class="app-control__applications">
      <h3 class="app-control__applications-title">
        Applications
      </h3>
      <div class="app-control__applications-content">
        <div
          v-for="app in apps"
          :key="app.id"
          class="app-control__app"
        >
          <div
            class="app-control__app-icon-wrap"
            :style="{ 'background-color': app.color }"
          >
            <icon
              :icon="app.icon"
              :width="16"
              :height="16"
              :color="app.iconColor"
            />
          </div>

          <div class="app-control__app-name">
            {{ app.name }}
          </div>

          <var-button
            text
            :text-color="app.action === 'open' ? '#0090ec' : '#fff'"
            :color="app.action === 'open' ? '#fff' : '#0090ec'"
            class="app-control__app-btn"
            @click="app.clickFn()"
          >
            {{ app.action }}
          </var-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .app-control {
    --sidebar-width: 192px;

    display: flex;
    width: 100%;
    height: 100%;
    border-radius: 16px;
    justify-content: space-between;
    align-items: stretch;

    &__sidebar {
      position: relative;
      width: var(--sidebar-width);
      background-color: var(--gray-50, #f2f2f2);
      padding: 16px;

      &-action {
        position: absolute;
        left: 16px;
        right: 16px;
        bottom: 16px;
        height: 108px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: stretch;
      }

      &-btn {
        --button-normal-height: 32px;
        --font-size-md: 12px;

        .var-button__content {
          font-weight: 500;
        }
      }
    }

    &__logo {
      margin-bottom: 16px;
    }

    &__avatar {
      position: relative;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin-bottom: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    &__user {
      font-size: 12px;
      line-height: 16px;
      font-weight: 500;
      color: #000;
      display: inline-block;
      max-width: 100%;
      word-break: break-word;
    }

    &__applications {
      position: relative;
      width: 100%;
      background-color: var(--system-white, #fff);
      padding: 16px;

      &-title {
        font-size: 12px;
        line-height: 16px;
        font-weight: 600;
        color: var(--black-90, #212121);
        margin: 0 0 12px;
      }

      &-content {
        position: relative;
        width: 100%;
        height: calc(100% - 28px);
        overflow-y: auto;

        .app-control__app:last-child {
          margin-bottom: 0;
        }
      }
    }

    &__app {
      display: flex;
      height: 64px;
      justify-content: flex-start;
      align-items: center;
      background-color: var(--gray-50, #f2f2f2);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 8px;

      &-icon-wrap {
        position: relative;
        width: 32px;
        height: 32px;
        margin-right: 8px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      &-name {
        position: relative;
        font-size: 16px;
        font-weight: 400;
        color: var(--black-90, #212121);
        width: calc(100% - 136px);
      }

      &-btn {
        --button-normal-height: 32px;
        --font-size-md: 12px;

        width: 96px;

        .var-button__content {
          font-weight: 500;
          text-transform: capitalize;
        }
      }
    }

  }
</style>
