import { getReduxConnection } from "./redux-devtools"
import { connectAtom } from "./utils/connectAtom"
import { CONFIG, Store } from "../core"
import { middleware } from "../middleware"

const getKey = (store: Store) => `${CONFIG.name}${store.toString()}`

export interface ApplyDevtoolsOptions {
  disable?: boolean
}

export const reduxDevtools = middleware<ApplyDevtoolsOptions | undefined>(
  ({ type, store, atom, options = {}, value }) => {
    const { disable } = options
    if (disable || type !== "SET") return

    const connection = getReduxConnection(getKey(store))
    if (connection == null) return

    const updateAtomValue = connectAtom(store, connection, atom)
    updateAtomValue(value)
  }
)
