import type { AppActions } from './types';
import type { ConnectivityStatus } from '@/types';

export const getConnectivityStatus: AppActions['getConnectivityStatus'] = async function (this) {
  const status = await w3n.connectivity!.isOnline();
  if (status) {
    const parsedStatus = status.split('_');
    this.connectivityStatus = parsedStatus[0] as ConnectivityStatus;
  }
};
