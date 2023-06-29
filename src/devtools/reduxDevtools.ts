import { getReduxConnection } from "./redux-devtools"
import { cache } from "./utils/cache"
import { connectAtom } from "./utils/connectAtom"
import { updates } from "./utils/updates"
import { CONFIG, Store } from "../core"
import { middleware } from "../middleware"

const getKey = (store: Store) => `${CONFIG.name}${store.toString()}`

export interface ApplyDevtoolsOptions {
  /** Disables the middleware. Useful for production. */
  disable?: boolean
}

/** Middleware to make use of the
 *  [redux devtools](https://github.com/reduxjs/redux-devtools)
 *  browser extension.
 *
 * @param options.disable Disables the middleware. Useful for production.
 *
 * @returns The middleware to be used on atoms.
 **/
export const reduxDevtools = middleware<ApplyDevtoolsOptions | undefined>(
  ({ options = {} }) => {
    if (options.disable) return {}

    return {
      init: ({ store, atom }) => {
        const connection = getReduxConnection(getKey(store))
        if (connection == null) return

        connectAtom(connection, store, atom)
      },
      set: ({ store, atom, value }) => {
        if (updates.isPaused(store)) return

        const connection = getReduxConnection(getKey(store))
        if (connection == null) return

        cache.setAtomValue(store, atom, value)
        connection.send(
          { type: `SET/${atom.toString()}` },
          cache.getStore(store)
        )
      },
    }
  }
)
