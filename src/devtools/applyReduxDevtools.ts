import { getReduxConnection } from "./redux-devtools"
import { connectAtom } from "./utils/connectAtom"
import { CONFIG } from "../core"
import { createMiddleware } from "../middleware"

export interface ApplyDevtoolsOptions {
  disable?: boolean
  preventInit?: boolean
}

export const applyReduxDevtools = createMiddleware<
  ApplyDevtoolsOptions | undefined
>(({ atom, options = {} }) => {
  const { disable, preventInit } = options
  const connection = getReduxConnection(CONFIG.name)
  if (disable || connection == null) return {}

  const updateAtomValue = connectAtom(connection, atom, preventInit)
  return {
    onSet: value => {
      updateAtomValue(value)
    },
  }
})
