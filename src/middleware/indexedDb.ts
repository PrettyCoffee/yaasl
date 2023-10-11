import { middleware } from "./middleware"
import { Store } from "./utils/Store"
import { CONFIG } from "../core"

let atomDb: Store<unknown> | null = null

export interface IndexedDbOptions {
  key?: string
}

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
