import {
  AnyAtom,
  InferAtom,
  AtomTypesLookup,
  applyMiddleware,
} from "@yaasl/vanilla"

import { CONFIG } from "./config"
import { Connection, getReduxConnection } from "./utils/getReduxConnection"

const store: Record<string, unknown> = {}

const updateAtomValue = (
  connection: Connection,
  atomName: string,
  value: unknown
) => {
  store[atomName] = value
  connection.send({ type: `${String(atomName)}/SET` }, store)
}

const subscribeAtom = (connection: Connection, atom: AnyAtom<unknown>) => {
  connection.subscribe(({ type, payload, state }) => {
    // ToDo: Add switch case for incoming actions
    console.log(type, payload, state)
    atom.get()
  })
}

const initAtom = (
  connection: Connection,
  atom: AnyAtom<unknown>,
  preventInit?: boolean
) => {
  store[atom.toString()] = atom.get()
  if (!preventInit) connection.init(store)

  subscribeAtom(connection, atom)

  return (value: unknown) => {
    updateAtomValue(connection, atom.toString(), value)
  }
}

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
  const connection = disable ? null : getReduxConnection(CONFIG.name)
  if (connection == null) return atom

  const updateAtomValue = initAtom(connection, atom, preventInit)

  return applyMiddleware(atom, {
    onSet: value => {
      updateAtomValue(value)
      return value
    },
  })
}
