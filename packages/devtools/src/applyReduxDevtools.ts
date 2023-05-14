import {
  AnyAtom,
  InferAtom,
  AtomTypesLookup,
  applyMiddleware,
} from "@yaasl/vanilla"

import { CONFIG } from "./config"
import { connectAtom } from "./utils/connectAtom"
import { getReduxConnection } from "./utils/getReduxConnection"

const connection = getReduxConnection(CONFIG.name)

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
  if (disable || connection == null) return atom

  const updateAtomValue = connectAtom(connection, atom, preventInit)

  return applyMiddleware(atom, {
    onSet: value => {
      updateAtomValue(value)
      return value
    },
  })
}
