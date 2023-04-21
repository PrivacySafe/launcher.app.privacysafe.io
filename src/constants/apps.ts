export const apps: App[] = [
  {
    id: 'inbox.app.privacysafe.io',
    icon: 'round-mail',
    iconColor: 'var(--green-grass-100, #33c653)',
    color: 'var(--green-grass-30, #bef2c1)',
    name: 'Mail',
    action: 'open',
  },
  {
    id: 'chat.app.privacysafe.io',
    icon: 'round-chat',
    iconColor: 'var(--purple-100, #4744e4)',
    color: 'var(--purple-30, #bab9f9)',
    name: 'Messenger',
    action: 'open',
  },
  {
    id: 'files.app.privacysafe.io',
    icon: 'round-cloud',
    iconColor: 'var(--magenta-100, #b22ca5)',
    color: 'var(--magenta-30, #f0b8ea)',
    name: 'Storage',
    action: 'install',
  },
  {
    id: 'contacts.app.privacysafe.io',
    icon: 'round-people',
    iconColor: 'var(--pear-100, #f75d53)',
    color: 'var(--pear-30, #ffcfc8)',
    name: 'Contacts',
    action: 'open',
  },
]

export const installerAppId = 'installer.app.privacysafe.io'
export const launcherAppId = 'launcher.app.privacysafe.io'

export const appActions = {
	onBundled: 'install & open',
	onInstalled: 'open'
}
