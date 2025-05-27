export type AppMenuItem = {
  id: string;
  name: string;
  icon?: string;
  routeName: string;
};

export const APP_MENU_DATA: AppMenuItem[] = [
  {
    id: '0',
    name: 'My Apps',
    icon: 'round-apps',
    routeName: 'my-apps',
  },
  {
    id: '1',
    name: 'App Store',
    icon: 'app-store',
    routeName: 'app-store',
  },
  {
    id: '2',
    name: 'Settings',
    icon: 'outline-settings',
    routeName: 'settings',
  },
];
