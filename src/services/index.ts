import { AppConfigsInternal, UISettings } from './ui-settings';

export let settingsService: AppConfigsInternal;

export async function initializationServices() {
  try {
    settingsService = await UISettings.makeInternalService();
    console.info('\n--- initializationServices DONE---\n');
  } catch (e) {
    console.error('\nERROR into initializationServices: ', e);
  }
}
