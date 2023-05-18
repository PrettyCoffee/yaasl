import { createMiddleware } from "@yaasl/core"

import { CONFIG } from "./config"
import { connectAtom } from "./utils/connectAtom"
import { Connection, getReduxConnection } from "./utils/getReduxConnection"

let connection: Connection | null = null

export interface ApplyDevtoolsOptions {
  disable?: boolean
  preventInit?: boolean
}

export const applyReduxDevtools = createMiddleware<
  ApplyDevtoolsOptions | undefined
>(({ atom, options = {} }) => {
  const { disable, preventInit } = options
  if (connection == null) connection = getReduxConnection(CONFIG.name)
  if (disable || connection == null) return {}

  const updateAtomValue = connectAtom(connection, atom, preventInit)
  return {
    onSet: value => {
      updateAtomValue(value)
    },
  }
})
