import { middleware } from "./middleware"
import { Store } from "./utils/Store"
import { CONFIG } from "../base"

let atomDb: Store<unknown> | null = null

export interface IndexedDbOptions {
  /** Use your own store key. Will be `atom.name` by default. */
  key?: string
}

/** Middleware to save and load atom values to an indexedDb.
 *
 *  Will use one database and store for all atoms with your `CONFIG.name`
 *  as name or `yaasl` if not set.
 *
 * @param {IndexedDbOptions | undefined} options
 * @param options.key Use your own store key. Will be `atom.name` by default.
 *
 * @returns The middleware to be used on atoms.
 **/
export const indexedDb = middleware<IndexedDbOptions | undefined>(
  ({ atom, options }) => {
    const key = options?.key ?? atom.name
    return {
      init: ({ atom }) => {
        if (!atomDb) {
          atomDb = new Store(CONFIG.name ?? "yaasl")
        }
        void atomDb.get(key).then(async value => {
          if (value !== undefined) {
            atom.set(value)
          } else {
            await atomDb?.set(key, atom.defaultValue)
          }
        })
      },
      set: ({ value }) => {
        void atomDb?.set(key, value)
      },
    }
  }
)
