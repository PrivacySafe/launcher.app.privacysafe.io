/*
 Copyright (C) 2024 3NSoft Inc.

 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { getGlobalEventsSink } from "@/services";
import { installBundledApp } from "./installBundledApp";
import { updateAppsAndLaunchersInfoInStore } from "./updateAppsAndLaunchersInfoInStore";
import { debouncedFnCall } from "@/utils";

export const installBundledAppsIntoNewSystem = debouncedFnCall(async () => {
  const {
    "app-packs": appPacks
  } = await w3n.system!.platform!.getCurrentVersion();
  const bundledAppsForInstall = Object.entries(appPacks)
  .map(([ id, version ]) => ({ id, version }));

  if (bundledAppsForInstall.length === 0) {
    // there is nothing to install
    return;
  }

  const $emit = getGlobalEventsSink();

  $emit('init-setup:start', {
    bundledAppsForInstall: bundledAppsForInstall.map(({ id }) => id)
  });

  const installProcs = bundledAppsForInstall
  .map(({ id, version }) => installBundledApp(id, version))
  .map(proc => proc.then(updateAppsAndLaunchersInfoInStore).catch(noop));

  await Promise.all(installProcs);

  $emit('init-setup:done', null);

  w3n.system!.apps!.opener!.triggerAllStartupLaunchers();

  updateAppsAndLaunchersInfoInStore();
});

function noop() {}
