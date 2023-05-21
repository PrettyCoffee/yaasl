import { createMiddleware } from "@yaasl/core"

import { CONFIG } from "./config"
import { getReduxConnection } from "./redux-devtools"
import { connectAtom } from "./utils/connectAtom"

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
