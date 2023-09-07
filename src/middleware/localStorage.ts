import { middleware } from "./middleware"
import { Expiration, ExpirationOptions } from "./utils/Expiration"
import { Atom, CONFIG } from "../core"
import { consoleMessage, log } from "../utils/log"

const STORAGE = window.localStorage

export interface LocalStorageParser<T = any> {
  parse: (value: string) => T
  stringify: (value: T) => string
}

const defaultParser: LocalStorageParser = {
  parse: JSON.parse,
  stringify: JSON.stringify,
}

const setStorageValue = <T>(
  key: string,
  value: T,
  parser: LocalStorageParser
) => {
  try {
    STORAGE.setItem(key, parser.stringify(value))
  } catch {
    log.error(
      `Value of atom with local storage key "${key}" could not be set.`,
      {
        value,
      }
    )
  }
}

const parseStorageValue = (
  key: string,
  value: string | null,
  parser: LocalStorageParser
) => {
  try {
    return typeof value !== "string" ? null : (parser.parse(value) as unknown)
  } catch {
    throw new Error(
      consoleMessage(`Value of local storage key "${key}" could not be parsed.`)
    )
  }
}

const getStorageValue = (key: string, parser: LocalStorageParser) => {
  const value = STORAGE.getItem(key)
  return parseStorageValue(key, value, parser)
}

const syncOverBrowserTabs = (
  atom: Atom,
  atomKey: string,
  parser: LocalStorageParser
) =>
  window.addEventListener("storage", ({ key, newValue }) => {
    if (atomKey !== key) return
    atom.set(parseStorageValue(key, newValue, parser))
  })

export interface LocalStorageOptions
  extends Pick<ExpirationOptions, "expiresAt" | "expiresIn"> {
  /** Use your own key for the local storage.
   *  Will be "{config-name}/{atom-name}" by default.
   */
  key?: string
  /** Disable the synchronization of values over browser tabs */
  noTabSync?: boolean
  /** Custom functions to stringify and parse values.
   *  Defaults to JSON.stringify and JSON.parse.
   *  Use this when handling complex datatypes like Maps or Sets.
   */
  parser?: LocalStorageParser
}

/** Middleware to save and load atom values to the local storage.
 *
 * @param {LocalStorageOptions | undefined} options
 * @param options.key Use your own key for the local storage.
 *   Will be "{config-name}/{atom-name}" by default.
 * @param options.noTabSync Disable the synchronization of values over browser tabs.
 * @param options.expiresAt Date at which the value expires
 * @param options.expiresIn Milliseconds in which the value expires. Will be ignored if expiresAt is set.
 * @param options.parser Custom functions to stringify and parse values. Defaults to JSON.stringify and JSON.parse. Use this when handling complex datatypes like Maps or Sets.
 *
 * @returns The middleware to be used on atoms.
 **/
export const localStorage = middleware<LocalStorageOptions | undefined>(
  ({ atom, options = {} }) => {
    const internalKey = CONFIG.name ? `${CONFIG.name}/${atom.name}` : atom.name
    const { key = internalKey, parser = defaultParser } = options

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
        const existing = getStorageValue(key, parser)
        if (existing === null) {
          setStorageValue(key, atom.defaultValue, parser)
        } else {
          atom.set(existing)
        }

        if (!options.noTabSync) syncOverBrowserTabs(atom, key, parser)
        if (hasExpiration) expiration.init(reset)
      },
      set: ({ value }) => {
        setStorageValue(key, value, parser)
        if (hasExpiration && value !== atom.defaultValue) {
          expiration.set(reset)
        }
      },
    }
  }
)
