import { middleware } from "./middleware"
import { CONFIG, Store } from "../core"
import { consoleMessage, log } from "../utils/log"

const STORAGE = window.localStorage

const setStorageValue = <T>(key: string, value: T) => {
  try {
    STORAGE.setItem(key, JSON.stringify(value))
  } catch {
    log.error(
      `Value of atom with local storage key "${key}" could not be set.`,
      {
        value,
      }
    )
  }
}

const getStorageValue = <T>(key: string) => {
  const value = STORAGE.getItem(key)
  try {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return typeof value !== "string" ? null : (JSON.parse(value) as T)
  } catch {
    throw new Error(
      consoleMessage(`Value of local storage key "${key}" could not be parsed.`)
    )
  }
}

interface Options {
  key?: string
}

/** Middleware to save and load atom values to the local storage.
 *
 * @param options.key Use your own key for the local storage.
 *   Will be "{config-name}{store-name}/{atom-name}" by default.
 *
 * @returns A middleware object
 **/
export const localStorage = middleware<Options | undefined>(
  ({ atom, options = {} }) => {
    const getKey = (store: Store) =>
      options.key ?? `${CONFIG.name}${store.toString()}/${atom.toString()}`

    return {
      init: ({ store }) => {
        const key = getKey(store)
        const existing = getStorageValue(key)
        if (existing === null) setStorageValue(key, atom.defaultValue)
        else store.set(atom, existing)
      },
      set: ({ store, value }) => {
        const key = getKey(store)
        setStorageValue(key, value)
      },
      remove: ({ store }) => {
        const key = getKey(store)
        STORAGE.removeItem(key)
      },
    }
  }
)
