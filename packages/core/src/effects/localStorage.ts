import { createEffect } from "./createEffect"
import { CONFIG } from "../base"
import { LocalStorage } from "../utils/LocalStorage"

export interface LocalStorageParser<T = any> {
  parse: (value: string) => T
  stringify: (value: T) => string
}

export interface LocalStorageOptions {
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
 * @param options.parser Custom functions to stringify and parse values. Defaults to JSON.stringify and JSON.parse. Use this when handling complex datatypes like Maps or Sets.
 *
 * @returns The effect to be used on atoms.
 **/
export const localStorage = createEffect<LocalStorageOptions | undefined>(
  ({ atom, options = {} }) => {
    const internalKey = CONFIG.name ? `${CONFIG.name}/${atom.name}` : atom.name
    const { key = internalKey, parser, noTabSync } = options

    const storage = new LocalStorage<unknown>(key, {
      parser,
      onTabSync: noTabSync ? undefined : value => atom.set(value),
    })

    return {
      init: ({ atom }) => {
        const existing = storage.get()
        if (existing === null) {
          storage.set(atom.defaultValue)
        } else {
          atom.set(existing)
        }
      },
      set: ({ value }) => {
        storage.set(value)
      },
    }
  }
)
