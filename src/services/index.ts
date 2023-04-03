import { makeServiceCaller } from '@/libs/ipc-service-caller'

export let settingsService: AppConfigsInternal

export async function initializationServices() {

  try {
    const srvConnection = await w3n.appRPC!('AppConfigsInternal')
    settingsService = makeServiceCaller<AppConfigsInternal>(
      srvConnection, [ 'getSettingsFile', 'saveSettingsFile', 'getCurrentLanguage', 'getCurrentColorTheme' ]
    ) as AppConfigsInternal

    console.info('\n--- initializationServices DONE---\n')
  } catch (e) {
    console.error('\nERROR into initializationServices: ', e)
  }
}
