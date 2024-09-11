import type { PiniaGetterTree } from '@v1nt1248/3nclient-lib/plugins';
import type { AppStore } from '../types';

export type Getters = {
  applicationsIdsForInstallAndUpdate: string[];
};

export type AppGetters = PiniaGetterTree<Getters, AppStore<Getters>>;
