/* eslint-disable @typescript-eslint/triple-slash-reference, no-case-declarations */
/// <reference path="../@types/index.d.ts" />
/// <reference path="../@types/platform-defs/test-stand.d.ts" />
// @deno-types="./ipc-service.d.ts"
import { MultiConnectionIPCWrap } from './ipc-service.js'
// @ts-ignore
import { appSettingsFileName, defaultSettings } from "../src/constants/settings.ts"
// @ts-ignore
import { themeColors } from '../src/constants/ui.ts'
// @ts-ignore
import { SingleProc } from '../src/helpers/processes.ts'

declare let Deno: {
  exit: () => void;
}

interface NewConfig {
  lang: AvailableLanguages;
  currentTheme: AvailableColorThemes;
  colors: Record<string, string>;
}

class SettingsService {
  public readonly fileProc = new SingleProc()
  private latestValue: AppSettings|undefined = undefined
  private readonly observers = new Set<web3n.Observer<NewConfig>>()

  public async getSettingsFile(): Promise<AppSettings> {
    if (!this.latestValue) {
      const fs = await (w3n.storage as web3n.storage.Service).getAppLocalFS()
      try {
        const res = await this.fileProc.startOrChain(
          () => fs.readJSONFile<AppSettings>(appSettingsFileName)
        )
        this.latestValue = res
        return res
      } catch (e) {
        const { notFound, path } = e as web3n.files.FileException
        if (path !== appSettingsFileName || !notFound) {
          if (w3n.log) {
            await w3n.log('error', 'Error read config file: ', e)
          }
        }
        return defaultSettings
      } finally {
        await fs.close()
      }
    }
    return this.latestValue!
  }

  public async saveSettingsFile(data: AppSettings): Promise<void> {
    this.latestValue = data
    const fs = await (w3n.storage as web3n.storage.Service).getAppLocalFS()
    try {
      await this.fileProc.startOrChain(
        () => fs.writeJSONFile(appSettingsFileName, this.latestValue)
      )
      this.notifyAllObservers(data);
    } catch (e) {
      if (w3n.log) {
        await w3n.log('error', 'Error saving settings file.', e)
      }
    } finally {
      await fs.close()
    }
  }

  public async getCurrentLanguage(): Promise<AvailableLanguages> {
    const settings = await this.getSettingsFile()
    const { currentConfig } = settings
    return currentConfig['language'] as AvailableLanguages
  }

  public async getCurrentColorTheme(): Promise<{
    currentTheme: AvailableColorThemes; colors: Record<string, string>;
  }> {
    const settings = await this.getSettingsFile()
    const { currentConfig } = settings
    const currentTheme = currentConfig['theme'] as AvailableColorThemes
    return {
      currentTheme,
      colors: themeColors[currentTheme],
    }
  }

  private notifyAllObservers(data: AppSettings): void {
    const { language, theme } = data.currentConfig as {
      language: AvailableLanguages;
      theme: AvailableColorThemes;
    }
    const newConf = {
      lang: language,
      currentTheme: theme,
      colors: themeColors[theme]
    }
    for (const obs of this.observers) {
      if (obs.next) {
        obs.next(newConf)
      }
    }
  }

  public watchConfig(obs: web3n.Observer<NewConfig>): () => void {
    this.observers.add(obs);
    return () => this.observers.delete(obs);
  }

  public completeAllWatchers(): void {
    for (const obs of this.observers) {
      if (obs.complete) {
        obs.complete()
      }
    }
    this.observers.clear()
  }

}

class ServiceWrap extends MultiConnectionIPCWrap {

  constructor(
    srvName: string,
    private readonly fileProc: SingleProc
  ) {
		super(srvName);
	}

  protected onListeningCompletion(): Promise<void> {
    return this.fileProc.startOrChain(async () => Deno.exit());
  }

  protected async onListeningError(err: any): Promise<void> {
    await super.onListeningError(err);
    await this.fileProc.startOrChain(async () => Deno.exit());
  }

}

const srv = new SettingsService()

const srvWrapInternal = new ServiceWrap('AppConfigsInternal', srv.fileProc)
const srvWrap = new ServiceWrap('AppConfigs', srv.fileProc)

srvWrapInternal.exposeReqReplyMethods(srv, ['getSettingsFile', 'saveSettingsFile', 'getCurrentLanguage', 'getCurrentColorTheme'])
srvWrapInternal.exposeObservableMethods(srv, ['watchConfig'])

srvWrap.exposeReqReplyMethods(srv, ['getCurrentLanguage', 'getCurrentColorTheme'])
srvWrap.exposeObservableMethods(srv, ['watchConfig'])

srvWrapInternal.startIPC()
srvWrap.startIPC()
