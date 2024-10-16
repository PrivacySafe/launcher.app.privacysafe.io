/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import type { Store } from 'pinia';
import type { PiniaActionTree } from '@v1nt1248/3nclient-lib/plugins';

export interface ProcessStoreState {
  processes: Record<string, { process: 'downloading' | 'installing'; value?: number }>;
}

export type Actions = {
  upsertProcess(appId: string, processInfo: { process: 'downloading' | 'installing'; value?: number }): void;
  delProcess(appId: string): void;
};

export type ProcessStore<G = unknown> = Store<'process', ProcessStoreState, G, Actions>;

export type ProcessActions = PiniaActionTree<Actions, ProcessStore>;
