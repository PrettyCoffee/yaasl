import {
  AnyAtom,
  InferAtom,
  AtomTypesLookup,
  applyMiddleware,
} from "@yaasl/core"

import { CONFIG } from "./config"
import { connectAtom } from "./utils/connectAtom"
import { Connection, getReduxConnection } from "./utils/getReduxConnection"

let connection: Connection | null = null

export interface ApplyDevtoolsOptions {
  disable?: boolean
  preventInit?: boolean
}

export const applyReduxDevtools = <
  Atom extends AnyAtom<
    AtomTypes["value"],
    AtomTypes["getResult"],
    AtomTypes["setArg"],
    AtomTypes["extension"]
  >,
  AtomTypes extends AtomTypesLookup = InferAtom<Atom>
>(
  atom: Atom,
  { disable, preventInit }: ApplyDevtoolsOptions = {}
) => {
  if (connection == null) connection = getReduxConnection(CONFIG.name)
  if (disable || connection == null) return atom

  const updateAtomValue = connectAtom(connection, atom, preventInit)

  return applyMiddleware(atom, {
    onSet: value => {
      updateAtomValue(value)
      return value
    },
  })
}
