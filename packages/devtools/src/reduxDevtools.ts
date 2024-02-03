import { Atom, CONFIG, middleware } from "@yaasl/core"

import { ConnectionResponse, getReduxConnection } from "./redux-devtools"
import { cache } from "./utils/cache"
import { resetSubscriptions, subscribeStore } from "./utils/subscribeStore"
import { updates } from "./utils/updates"

const getKey = () => CONFIG.name ?? "yaasl"

let isInitPhase = true
export const connectAtom = (
  connection: ConnectionResponse,
  atom: Atom<any>
) => {
  cache.setAtomValue(atom, atom.get())

  if (isInitPhase) {
    connection.init(cache.getStore())
    subscribeStore(atom, connection)
  } else {
    connection.send({ type: `SET/${atom.name}` }, cache.getStore())
  }
}

export interface ReduxDevtoolsOptions {
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
export const reduxDevtools = middleware<ReduxDevtoolsOptions | undefined>(
  ({ atom, options = {} }) => {
    if (options.disable) return {}
    const connection = getReduxConnection(getKey())
    if (connection == null) return {}

    connectAtom(connection, atom)

    return {
      set: ({ atom, value }) => {
        isInitPhase = false
        if (updates.isPaused()) return

        cache.setAtomValue(atom, value)
        connection.send({ type: `SET/${atom.name}` }, cache.getStore())
      },
    }
  }
)

/* For internal testing only */
export const disconnectAllConnections = () => {
  cache.reset()
  resetSubscriptions()
  isInitPhase = true
}
