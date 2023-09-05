import { middleware } from "./middleware"
import { Expiration, ExpirationOptions } from "./utils/Expiration"
import { Atom, CONFIG } from "../core"
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

const parseStorageValue = <T>(key: string, value: string | null) => {
  try {
    return typeof value !== "string" ? null : (JSON.parse(value) as T)
  } catch {
    throw new Error(
      consoleMessage(`Value of local storage key "${key}" could not be parsed.`)
    )
  }
}

const getStorageValue = <T>(key: string) => {
  const value = STORAGE.getItem(key)
  return parseStorageValue<T>(key, value)
}

const syncOverBrowserTabs = (atom: Atom, atomKey: string) =>
  window.addEventListener("storage", ({ key, newValue }) => {
    if (atomKey !== key) return
    atom.set(parseStorageValue(key, newValue))
  })

export interface LocalStorageOptions
  extends Pick<ExpirationOptions, "expiresAt" | "expiresIn"> {
  key?: string
  noTabSync?: boolean
}

/** Middleware to save and load atom values to the local storage.
 *
 * @param options.key Use your own key for the local storage.
 *   Will be "{config-name}/{atom-name}" by default.
 * @param options.noTabSync Disable the synchronization of values over browser tabs.
 * @param options.expiresAt Date at which the value expires
 * @param options.expiresIn Milliseconds in which the value expires. Will be ignored if expiresAt is set.
 *
 * @returns The middleware to be used on atoms.
 **/
export const localStorage = middleware<LocalStorageOptions | undefined>(
  ({ atom, options = {} }) => {
    const internalKey = CONFIG.name ? `${CONFIG.name}/${atom.name}` : atom.name
    const key = options.key ?? internalKey

    const hasExpiration = Boolean(options.expiresAt ?? options.expiresIn)
    const expiration = new Expiration({
      key: `${key}-expires-at`,
      ...options,
    })

    const reset = () => {
      expiration.remove()
      atom.set(atom.defaultValue)
    }

    return {
      init: ({ atom }) => {
        const existing = getStorageValue(key)
        if (existing === null) {
          setStorageValue(key, atom.defaultValue)
        } else {
          atom.set(existing)
        }

        if (!options.noTabSync) syncOverBrowserTabs(atom, key)
        if (hasExpiration) expiration.init(reset)
      },
      set: ({ value }) => {
        setStorageValue(key, value)
        if (hasExpiration && value !== atom.defaultValue) {
          expiration.set(reset)
        }
      },
    }
  }
)
