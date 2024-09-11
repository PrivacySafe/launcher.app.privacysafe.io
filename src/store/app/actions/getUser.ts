import type { AppActions } from '@/store/app/actions/types';

export const getUser: AppActions['getUser'] = async function (this) {
  this.user = await w3n.mailerid!.getUserId();
};
