export interface AppViewManifest extends web3n.caps.GeneralAppManifest {
  launchOnSystemStartup: Array<web3n.caps.Launcher & { iconFile?: Uint8Array }>;
}

export interface AppView extends web3n.apps.AppVersions {
  manifest?: AppViewManifest;
}

export type AvailableLanguage = 'en';

export type AvailableColorTheme = 'default' | 'dark';

export type AppConfig = {
  lang: AvailableLanguage;
  colorTheme: AvailableColorTheme;
};

export type ConnectivityStatus = 'offline' | 'online';

export type GlobalEvents = {
  'install:complete': null;
  'install:complete:next': null;
};
