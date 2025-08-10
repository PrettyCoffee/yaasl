import { createEffect } from "./create-effect"
import { CONFIG } from "../base"
import { getScopedKey } from "../utils/get-scoped-key"
import { IdbStore } from "../utils/idb-store"

let atomDb: IdbStore<unknown> | null = null

const createSync = (storeKey: string, onTabSync: () => void) => {
  const key = getScopedKey(storeKey)
  const channel = new BroadcastChannel(key)

  let changeTrigger: "self" | "sync" | null = null
  channel.onmessage = () => {
    console.log(changeTrigger)
    if (changeTrigger === "self") {
      changeTrigger = null
      return
    }
    changeTrigger = "sync"
    onTabSync()
  }

  return {
    pushSync: () => {
      console.log(changeTrigger)
      if (changeTrigger === "sync") {
        changeTrigger = null
        return
      }
      changeTrigger = "self"
      channel.postMessage("sync")
    },
  }
}

export interface IndexedDbOptions {
  /** Use your own store key. Will be `atom.name` by default. */
  key?: string
  /** Disable the synchronization of values over browser tabs */
  noTabSync?: boolean
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

    const { pushSync } = options?.noTabSync
      ? {}
      : createSync(key, () => {
          void atomDb?.get(key).then(value => {
            if (!value) return
            atom.set(value)
          })
        })

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
        // don't wait to set the atom value,directly pass it into the atom
        void atomDb?.set(key, value).then(pushSync)
      },
    }
  }
)
