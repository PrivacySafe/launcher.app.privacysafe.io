import { defineStore } from 'pinia';
import { state } from './state';
import { getters } from './getters';
import { appActions } from './actions';

export const appStore = defineStore({
  id: 'app',
  state: () => state,
  getters,
  actions: appActions,
});
