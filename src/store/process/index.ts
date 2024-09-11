import { defineStore } from 'pinia';
import { set } from 'lodash';
import type { ProcessStoreState, ProcessActions } from './types';

const upsertProcess: ProcessActions['upsertProcess'] = function (
  appId: string,
  processInfo: { process: 'downloading' | 'installing'; value?: number },
) {
  set(this.processes, [appId], processInfo);
};

const delProcess: ProcessActions['delProcess'] = function (appId: string) {
  delete this.processes[appId];
};

const actions: ProcessActions = {
  upsertProcess,
  delProcess,
};

export const processStore = defineStore({
  id: 'process',
  state: (): ProcessStoreState => ({
    processes: {},
  }),
  actions,
});
