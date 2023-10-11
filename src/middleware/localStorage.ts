import { middleware } from "./middleware"
import { Expiration, ExpirationOptions } from "./utils/Expiration"
import { LocalStorage } from "./utils/LocalStorage"
import { CONFIG } from "../core"

export interface LocalStorageParser<T = any> {
  parse: (value: string) => T
  stringify: (value: T) => string
}

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
    const { key = internalKey, parser, noTabSync } = options

    const hasExpiration = Boolean(options.expiresAt ?? options.expiresIn)
    const expiration = new Expiration({
      key: `${key}-expires-at`,
      ...options,
    })

    const storage = new LocalStorage<unknown>(key, {
      parser,
      onTabSync: noTabSync ? undefined : value => atom.set(value),
    })

    const reset = () => {
      expiration.remove()
      atom.set(atom.defaultValue)
    }

    return {
      init: ({ atom }) => {
        const existing = storage.get()
        if (existing === null) {
          storage.set(atom.defaultValue)
        } else {
          atom.set(existing)
        }

        if (hasExpiration) expiration.init(reset)
      },
      set: ({ value }) => {
        storage.set(value)
        if (hasExpiration && value !== atom.defaultValue) {
          expiration.set(reset)
        }
      },
    }
  }
)
