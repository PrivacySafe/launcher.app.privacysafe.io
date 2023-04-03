export const appSettingsFileName = 'settings.json'

const allLanguages: AppSettingsMenuItemValue<'language'>[] = [
  { section: 'language', code: 'en', name: 'English' },
]

const allColorThemes: AppSettingsMenuItemValue<'theme'>[] = [
  { section: 'theme', code: 'default', name: 'Light (Default)' },
  { section: 'theme', code: 'dark', name: 'Dark', disabled: true },
]


export const defaultSettings: AppSettings = {
  currentConfig: {
    language: 'en',
    theme: 'default',
  },
  lastReceiveMessageTS: 0,
}

export const appSetupMenu: Record<string, AppSettingsMenuItem<'language'|'theme'>> = {
  '0': {
    id: '0',
    section: 'language',
    sectionTitle: 'Languages',
    sectionValueTitle: 'Language',
    icon: 'baseline-language',
    value: allLanguages,
  },
  '1': {
    id: '1',
    section: 'theme',
    sectionTitle: 'Color Themes',
    sectionValueTitle: 'Color Theme',
    icon: 'baseline-brush',
    value: allColorThemes,
  },
}
