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
