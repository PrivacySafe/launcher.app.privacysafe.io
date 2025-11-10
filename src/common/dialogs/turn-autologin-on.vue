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
import { computed, inject, ref, Ref } from 'vue';
import { I18N_KEY, I18nPlugin } from '@v1nt1248/3nclient-lib/plugins';
import { Ui3nInput } from '@v1nt1248/3nclient-lib';

const props = defineProps<{
  loginPassword: Ref<string, string>
}>()

const { $tr } = inject<I18nPlugin>(I18N_KEY)!;

const loginPassword = props.loginPassword;

</script>

<template>
  <div :class="$style.frame">

    <ui3n-input
      type="password"
      :label="$tr('settings.label.autologin.enter_password')"
      :placeholder="$tr('settings.placeholder.password')"
      v-model=loginPassword
    />

  </div>
</template>

<style lang="scss" module>
.frame {
  padding-top: var('--spacing-m');
  padding-left: var('--spacing-m');
  padding-right: var('--spacing-m');
}
</style>
