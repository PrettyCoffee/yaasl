import { consoleMessage, log } from "../../utils/log"
import { Dispatch } from "../../utils/utilTypes"

const STORAGE = window.localStorage

export interface LocalStorageParser<T = any> {
  parse: (value: string) => T
  stringify: (value: T) => string
}

const defaultParser: LocalStorageParser = {
  parse: JSON.parse,
  stringify: JSON.stringify,
}

const syncOverBrowserTabs = (
  observingKey: string,
  onTabSync: (value: string | null) => void
) =>
  window.addEventListener("storage", ({ key, newValue }) => {
    if (observingKey !== key) return
    onTabSync(newValue)
  })

export interface LocalStorageConstructorOptions<T> {
  parser?: LocalStorageParser<T>
  onTabSync?: Dispatch<T | null>
}

export class LocalStorage<T = unknown> {
  private parser: LocalStorageParser<T>

  constructor(
    private readonly key: string,
    options: LocalStorageConstructorOptions<T> = {}
  ) {
    this.parser = options.parser ?? defaultParser

    if (!options.onTabSync) return
    syncOverBrowserTabs(key, value => {
      const newValue = value === null ? null : this.parser.parse(value)
      if (newValue === null) {
        this.remove()
      } else {
        this.set(newValue)
      }
      options.onTabSync?.(newValue)
    })
  }

  public get(): T | null {
    const value = STORAGE.getItem(this.key)
    try {
      return typeof value !== "string" ? null : this.parser.parse(value)
    } catch {
      throw new Error(
        consoleMessage(
          `Value of local storage key "${this.key}" could not be parsed.`
        )
      )
    }
  }

  public set(value: T) {
    try {
      if (value === null) {
        STORAGE.removeItem(this.key)
      } else {
        STORAGE.setItem(this.key, this.parser.stringify(value))
      }
    } catch {
      log.error(
        `Value of atom with local storage key "${this.key}" could not be set.`,
        { value }
      )
    }
  }

  public remove() {
    STORAGE.removeItem(this.key)
  }
}
