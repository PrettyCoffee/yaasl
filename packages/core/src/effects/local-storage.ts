import { getWindow } from "@yaasl/utils"

import { createEffect } from "./create-effect"
import { getScopedKey } from "../utils/get-scoped-key"
import { StringStorage, StringStorageParser } from "../utils/string-storage"

const syncOverBrowserTabs = (
  observingKey: string,
  onTabSync: (value: string | null) => void
) =>
  getWindow()?.addEventListener("storage", ({ key, newValue }) => {
    if (observingKey !== key) return
    onTabSync(newValue)
  })

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
  parser?: StringStorageParser
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
export const localStorage = createEffect<
  LocalStorageOptions | undefined,
  unknown
>(({ atom, options = {} }) => {
  const { key = getScopedKey(atom.name), parser, noTabSync } = options

  const storage = new StringStorage<unknown>({
    key,
    store: getWindow()?.localStorage,
    parser,
  })

  if (!noTabSync) {
    syncOverBrowserTabs(key, () => atom.set(storage.get() ?? atom.defaultValue))
  }

  return {
    sort: "pre",
    init: ({ set }) => {
      const existing = storage.get()
      if (existing != null) {
        set(existing)
      }
    },
    set: ({ value, atom }) => {
      if (value === atom.defaultValue) {
        storage.remove()
      } else {
        storage.set(value)
      }
    },
  }
})
