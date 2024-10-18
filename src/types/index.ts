export interface AppViewManifest extends web3n.caps.GeneralAppManifest {
  launchOnSystemStartup: Array<web3n.caps.Launcher & { iconFile?: Uint8Array }>;
}

export interface AppView extends web3n.system.apps.AppVersions {
  manifest?: AppViewManifest;
}

export interface Launcher extends web3n.caps.Launcher {
  iconBytes?: Uint8Array;
}

export interface AppLaunchers {
  appId: string;
  version: string;
  name: string;
  description: string;
  icon: string;
  iconBytes?: Uint8Array;
  defaultLauncher?: Launcher;
  staticLaunchers: Launcher[];
  dynamicLaunchers: Launcher[];
}

export type AvailableLanguage = 'en';

export type AvailableColorTheme = 'default' | 'dark';

export type AppConfig = {
  lang: AvailableLanguage;
  colorTheme: AvailableColorTheme;
};

export type ConnectivityStatus = 'offline' | 'online';

export interface UpdateAndInstallEvents {
  "install:complete": null;
  "install:complete:next": null;
}
