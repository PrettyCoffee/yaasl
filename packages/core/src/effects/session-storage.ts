import { getWindow } from "@yaasl/utils"

import { createEffect } from "./create-effect"
import { CONFIG } from "../base"
import { StringStorage, StringStorageParser } from "../utils/string-storage"

export interface SessionStorageOptions {
  /** Use your own key for the session storage.
   *  Will be "{config-name}/{atom-name}" by default.
   */
  key?: string
  /** Custom functions to stringify and parse values.
   *  Defaults to JSON.stringify and JSON.parse.
   *  Use this when handling complex datatypes like Maps or Sets.
   */
  parser?: StringStorageParser
}

/** Middleware to save and load atom values to the session storage.
 *
 * @param {SessionStorageOptions | undefined} options
 * @param options.key Use your own key for the session storage.
 *   Will be "{config-name}/{atom-name}" by default.
 * @param options.noTabSync Disable the synchronization of values over browser tabs.
 * @param options.parser Custom functions to stringify and parse values. Defaults to JSON.stringify and JSON.parse. Use this when handling complex datatypes like Maps or Sets.
 *
 * @returns The effect to be used on atoms.
 **/
export const sessionStorage = createEffect<
  SessionStorageOptions | undefined,
  unknown
>(({ atom, options = {} }) => {
  const internalKey = CONFIG.name ? `${CONFIG.name}/${atom.name}` : atom.name
  const { key = internalKey, parser } = options

  const storage = new StringStorage<unknown>({
    key,
    store: getWindow()?.sessionStorage,
    parser,
  })

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
