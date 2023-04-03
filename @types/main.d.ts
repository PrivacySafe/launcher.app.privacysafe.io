interface App {
  id: string;
  icon: string;
  iconColor: string;
  color: string;
  name: string;
  action: string;
}

type AppSettingsSection = 'language' | 'theme'
type AvailableLanguages = 'en'
type AvailableColorThemes = 'default' | 'dark'
type AppSettingsAvailableValue<T extends AppSettingsSection> = T extends 'language'
  ? AvailableLanguages
  : AvailableColorThemes

interface AppSettingsMenuItemValue<V extends AppSettingsSection> {
  section: AppSettingsSection;
  code:  AppSettingsAvailableValue<V>;
  name: string;
  disabled?: boolean;
}

interface AppSettingsMenuItem<V extends AppSettingsSection> {
  id: string;
  section: AppSettingsSection;
  sectionTitle: string;
  sectionValueTitle: string;
  icon: string;
  value: AppSettingsMenuItemValue<V>[];
}

type SetupFileData = Record<AppSettingsSection, AppSettingsAvailableValue<AppSettingsSection>>

interface AppSettings {
  currentConfig: SetupFileData;
  lastReceiveMessageTS: number;
}

interface AppConfigsInternal {
  getSettingsFile: () => Promise<AppSettings>;
  saveSettingsFile: (data: AppSettings) => Promise<void>;
  getCurrentLanguage: () => Promise<AvailableLanguages>;
  getCurrentColorTheme: () => Promise<{currentTheme: AvailableColorThemes, colors: Record<string, string> }>;
}

interface AppConfigs {
  getCurrentLanguage: () => Promise<AvailableLanguages>;
  getCurrentColorTheme: () => Promise<{currentTheme: AvailableColorThemes, colors: Record<string, string> }>;
}
