import { getWindow } from "@yaasl/utils"

import { createEffect } from "./create-effect"
import { CONFIG } from "../base"
import { getScopedKey } from "../utils/get-scoped-key"
import { IdbStore } from "../utils/idb-store"

let atomDb: IdbStore<unknown> | null = null

const createSync = (storeKey: string, onTabSync: () => void) => {
  const observingKey = getScopedKey(storeKey) + "/last-change"

  let changeTrigger: "sync" | "push" | null = null
  getWindow()?.addEventListener("storage", ({ key }) => {
    if (observingKey !== key) return
    if (changeTrigger === "push") {
      changeTrigger = null
      return
    }
    changeTrigger = "sync"
    onTabSync()
  })

  return {
    pushSync: () => {
      if (changeTrigger === "sync") {
        changeTrigger = null
        return
      }
      changeTrigger = "push"
      getWindow()?.localStorage.setItem(observingKey, Date.now().toString())
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
      set: async ({ value }) => {
        await atomDb?.set(key, value)
        pushSync?.()
      },
    }
  }
)
