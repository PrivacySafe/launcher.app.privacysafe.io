import { appActions, apps as appsViewData, installerAppId, launcherAppId } from '@/constants'

export interface AppView extends App {
	clickFn: () => Promise<void>;
}

const skipAppList = [ installerAppId, launcherAppId ];

export class DynamicAppsList {

	public readonly views: AppView[] = [];

	// XXX updates should be triggered by events from core

	private readonly opener: web3n.apps.AppsOpener;

	constructor(
		private readonly display: (views: AppView[]) => void
	) {
		if (!w3n.apps || !w3n.apps.opener) {
			throw new Error(`apps.opener capability is not given to this app`);
		}
		this.opener = w3n.apps.opener;
	}

	async checkAppsAndUpdateView(): Promise<void> {
		const lst = await this.opener.listApps();
		for (const app of lst) {
			if (skipAppList.includes(app.id)) { continue; }
			try {
				const appView = this.views.find(v => (app.id === v.id));
				if (appView) {
					const updated = this.checkViewAction(app, appView);
					if (updated) {
						this.refreshDisplay();
					}
				} else {
					this.views.push(await this.makeAppView(app));
					this.views.sort(sortAppViews);
					this.refreshDisplay();
				}
			} catch (err) {
				console.error(`Error in making app view`, app, err);
			}
		}
	}

	private refreshDisplay(): void {
		this.display(this.views.concat([]));
	}

	private async makeAppView(app: web3n.apps.AppInfo): Promise<AppView> {
		const { action, clickFn } = this.makeAction(app);

		// XXX at this moment we use static data from constants, but
		//     we'll need it to be dynamically extracted from app's info

		const viewData = appsViewData.find(d => (d.id === app.id));
		if (viewData) {
			return {
				id: app.id,
				name: viewData.name,
				color: viewData.color,
				icon: viewData.icon,
				iconColor: viewData.iconColor,
				action,
				clickFn
			};
		} else {
			// eslint-disable-next-line max-len
			throw new Error(`Application doesn't have corresponding static info, and we need to use app-provided params via this.opener.getAppInfo(app.id)`);
		}

	}

	private makeAction(app: web3n.apps.AppInfo): {
		action: AppView['action']; clickFn: AppView['clickFn'];
	} {
		if (app.installed) {
			return {
				action: appActions.onInstalled,
				clickFn: () => this.opener.openApp(app.id)
			};
		} else if (app.bundled) {
			return {
				action: appActions.onBundled,
				clickFn: () => this.opener.openApp(app.id)
			};
		} else {
			throw new Error(`App info misses expected fields`);
		}
	}

	private checkViewAction(app: web3n.apps.AppInfo, view: AppView): boolean {
		if ((app.installed && (view.action === appActions.onInstalled))
		|| (app.bundled && (view.action === appActions.onBundled))) {
			return false;
		} else {
			const { action, clickFn } = this.makeAction(app);
			view.action = action;
			view.clickFn = clickFn;
			return true;
		}
	}

}

function sortAppViews(a: AppView, b: AppView): number {
	if (a.id === b.id) { return 0; }
	const aPrivInd = appsViewData.findIndex(v => (v.id === a.id));
	const bPrivInd = appsViewData.findIndex(v => (v.id === b.id));
	if (aPrivInd < 0) {
		if (bPrivInd < 0) {
			return ((a.name < b.name) ? -1 : 1);
		} else {
			return 1;
		}
	} else {
		if (bPrivInd < 0) {
			return -1;
		} else {
			return ((a.name < b.name) ? -1 : 1);
		}
	}
}
