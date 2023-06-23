import { getReduxConnection } from "./redux-devtools"
import { connectAtom } from "./utils/connectAtom"
import { middleware } from "../new-middleware"

export interface ApplyDevtoolsOptions {
  disable?: boolean
  preventInit?: boolean
}

export const reduxDevtools = middleware<ApplyDevtoolsOptions | undefined>(
  ({ type, store, atom, options = {}, value }) => {
    if (type !== "SET") return
    const { disable, preventInit } = options
    const connection = getReduxConnection(store.toString())
    if (disable || connection == null) return

    const updateAtomValue = connectAtom(store, connection, atom, preventInit)
    updateAtomValue(value)
  }
)