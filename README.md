# Launcher app

PrivacySafe client side 3NWeb platform bundles this app. Launcher allows user to start, install and update 3NWeb apps in user's 3NWeb system.


## Building

`pnpm` is needed.

To initialize tooling in project's folder, run in terminal:
```
pnpm install --frozen-lockfile
```

To compile app, do:
```
pnpm run build
```
this should create an `app` folder. `app` folder together with `manifest.json` constitute complete 3NWeb app built.


## Internals

This app uses Vue 3 framework  with pinia storage.

Folder `ctrl-funcs` contains functions to start processes that are too broad to be bundled with particular pinia stores. These processes may touch different stores, use different `w3n` capabilities.


## License

Code is provided here under GNU General Public License, version 3.
