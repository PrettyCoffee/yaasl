import { createEffect } from "./create-effect"
import { CONFIG } from "../base"
import { IdbStore } from "../utils/idb-store"

let atomDb: IdbStore<unknown> | null = null

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
 * @returns The effect to be used on atoms.
 **/
export const indexedDb = createEffect<IndexedDbOptions | undefined, unknown>(
  ({ atom, options }) => {
    const key = options?.key ?? atom.name
    return {
      sort: "pre",
      init: async ({ atom, set }) => {
        if (!atomDb) {
          atomDb = new IdbStore(CONFIG.name ?? "yaasl")
        }

        const existing = await atomDb.get(key)
        if (existing != null) {
          set(existing)
        } else {
          await atomDb.set(key, atom.defaultValue)
        }
      },
      set: ({ value }) => {
        void atomDb?.set(key, value)
      },
    }
  }
)
