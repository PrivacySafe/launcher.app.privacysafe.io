/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { AppInfo } from "@/types";
import { NamedProcs, SingleProc } from "@v1nt1248/3nclient-lib/utils";
import { compare as compareSemVer } from 'semver';

export function userNameFromUserId(userId: string): string {
  const indOfAt = userId.indexOf('@');
  return indOfAt <= 0 ? '' : userId.substring(0, indOfAt);
}

export function userDomainFromUserId(userId: string): string {
  const indOfAt = userId.indexOf('@');
  return indOfAt <= 0 ? userId : userId.substring(indOfAt);
}

export function updateVersionIn(
  appInfo: AppInfo, channel?: string
): { version: string; isBundledVersion: boolean; }|undefined {
  const { updates, updateFromBundle } = appInfo;
  if (!updates) {
    if (channel || !updateFromBundle) {
      return;
    } else {
      return { version: updateFromBundle, isBundledVersion: true };
    }
  }

  if (channel) {
    const verOnServer = updates.find(u => (u.channel === channel))?.version;
    return (verOnServer ?
      { version: verOnServer, isBundledVersion: false } : undefined
    );
  }

  const verOnServer = ((updates.length === 1) ?
    updates[0].version :
    updates.reduce((u1, u2) => (
      (compareSemVer(u1.version, u2.version) > 1) ? u1 : u2
    )).version
  );

  if (!updateFromBundle || (compareSemVer(verOnServer, updateFromBundle) > 0)) {
    return { version: verOnServer, isBundledVersion: false };
  } else {
    return { version: updateFromBundle, isBundledVersion: true };
  }
}

export function debouncedFnCall<T extends Function>(
  func: T, callKeyGen?: (...args: any[]) => string
): T {
  if (callKeyGen) {
    const procs = new NamedProcs();
    return ((...args: any[]) => {
      const callKey = callKeyGen(...args);
      const inProgress = procs.getP<void>(callKey);
      if (inProgress) {
        return inProgress;
      } else {
        return procs.addStarted(callKey, func.apply(undefined, args));
      }
    }) as any as T;
  } else {
    const proc = new SingleProc();
    return ((...args: any[]) => {
      const inProgress = proc.getP<void>();
      if (inProgress) {
        return inProgress;
      } else {
        return proc.addStarted(func.apply(undefined, args));
      }
    }) as any as T;
  }
}

