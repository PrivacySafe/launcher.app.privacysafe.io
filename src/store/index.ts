import { appStore } from './app';
import type { AppStore } from './app/types';
import { processStore } from './process';
import type { ProcessStore } from './process/types';

export const useAppStore: () => AppStore = () => appStore();
export const useProcessStore: () => ProcessStore = () => processStore();
