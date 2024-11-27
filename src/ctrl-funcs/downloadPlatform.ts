/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { ProcessStore } from "@/store/process/types";
import { AppStore } from "@/store/app/types";
import { sleep } from "@v1nt1248/3nclient-lib/utils";
import { debouncedFnCall } from "@/utils";

export const downloadPlatformUpdate = debouncedFnCall(async (
  appStore: AppStore, procsStore: ProcessStore
) => {
  if (!appStore.platform.availableUpdates) {
    return;
  }
  const newBundleVersion = appStore.platform.availableUpdates[0].version;
  try {
    procsStore.upsertProcess(null, {
      procType: 'downloading', version: newBundleVersion, progressValue: 0
    });
    appStore.platform.updateInProcess = {
      version: newBundleVersion
    };

    let errEvent: any;
    w3n.system!.platform!.setupUpdater(newBundleVersion, {
      next: ev => {
        if (ev.event === 'download-progress') {
          procsStore.upsertProcess(null, {
            procType: 'downloading', version: newBundleVersion,
            progressValue: ev.info.percent
          });
          appStore.platform.updateInProcess!.progress = ev.info;
        }
        console.log(ev);
      },
      error: err => {
        errEvent = err;
      }
    });

    await sleep(10);
    if (errEvent) {
      throw errEvent;
    }

    const files = await w3n.system!.platform!.downloadUpdate();
    if (files) {
      appStore.setPlatformRestart(true);
    }
    delete appStore.platform.updateInProcess;

  } finally {
    if (appStore.restart?.platform) {
      procsStore.delProcess(null, 'downloading', {
        'platform:restart-to-update': null
      });
    } else {
      procsStore.delProcess(null, 'downloading');
    }
  }

});
