import { All_PRIVACYSAFE_APPLICATIONS, NOT_DISPLAYED_APPLICATIONS } from '@/constants';
import type { AppGetters } from './types';

export const getters: AppGetters = {
  applicationsIdsForInstallAndUpdate: function (this) {
    return All_PRIVACYSAFE_APPLICATIONS.filter(id => !NOT_DISPLAYED_APPLICATIONS.includes(id));
  },
};
