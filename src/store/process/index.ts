/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { defineStore } from 'pinia';
import type { ProcessStoreState, ProcessActions } from './types';
import { getGlobalEventsSink } from '@/services';
import { GlobalEvents } from '@/types';

const upsertProcess: ProcessActions['upsertProcess'] = function (
  appId, processInfo, evToEmit
) {
  if (appId === null) {
    appId = PLATFORM_ID;
  }
  const arr = this.processes[appId];
  if (arr) {
    const ind = arr.findIndex(
      ({ procType }) => (processInfo.procType === procType)
    );
    if (ind < 0) {
      arr.push(processInfo);
    } else {
      arr[ind] = processInfo;
    }
  } else {
    this.processes[appId] = [ processInfo ];
  }
  emitEvent(evToEmit);
};

const delProcess: ProcessActions['delProcess'] = function (
  appId, procType, evToEmit
) {
  if (appId === null) {
    appId = PLATFORM_ID;
  }
  const arr = this.processes[appId];
  if (!arr) { return; }
  const foundInd = arr.findIndex(info => (info.procType === procType));
  if (foundInd < 0) { return; }
  if (arr.length > 1) {
    arr.splice(foundInd, 1);
  } else {
    delete this.processes[appId];
  }
  emitEvent(evToEmit);
};

function emitEvent(evToEmit: Partial<GlobalEvents>|undefined): void {
  if (evToEmit) {
    for (const [ event, content ] of Object.entries(evToEmit)) {
      const $emit = getGlobalEventsSink();
      $emit(event as keyof GlobalEvents, content);
    }
  }
}

export const PLATFORM_ID = 'platform';

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
