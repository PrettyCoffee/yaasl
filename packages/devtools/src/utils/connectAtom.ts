import { Atom } from "@yaasl/vanilla"

import { Connection } from "./getReduxConnection"

/* Cache of the current value of all atoms. (Record<atomName, atomValue>) */
let store: Record<string, unknown | undefined> = {}

/* Cache of all connected atoms. (Record<atomName, atom>) */
let observedAtoms: Record<string, Atom | undefined> = {}

const synchronize = (state: Record<string, unknown>) =>
  Object.keys(observedAtoms).filter(key => {
    const newValue = state[key]
    if (newValue === store[key]) return false

    store[key] = newValue
    observedAtoms[key]?.set(newValue)
    return true
  })

const getInitialStore = () =>
  Object.keys(observedAtoms).reduce<Record<string, unknown>>((result, key) => {
    result[key] = observedAtoms[key]?.initialValue
    return result
  }, {})

let isSubscribed = false
let unsubscribe: (() => void) | undefined = undefined
const subscribeAtoms = (connection: Connection) => {
  isSubscribed = true
  unsubscribe = connection.subscribe(action => {
    const { payload } = action
    const nextState = !action.state
      ? null
      : // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        (JSON.parse(action.state) as Record<string, unknown>)

    switch (payload?.type) {
      case "JUMP_TO_ACTION":
      case "ROLLBACK":
        if (!nextState) return
        synchronize(nextState)
        break

      case "RESET":
        synchronize(getInitialStore())
        break

      case "COMMIT":
        connection.init(store)
        break

      case "IMPORT_STATE":
        payload.nextLiftedState.computedStates.forEach(({ state }) => {
          const changedKeys = synchronize(state)
          changedKeys.forEach(key =>
            connection.send({ type: `${key}/SET` }, store)
          )
        })
        break
    }
  })
}

const updateAtomValue = (
  connection: Connection,
  atomName: string,
  value: unknown
) => {
  store[atomName] = value
  connection.send({ type: `${String(atomName)}/SET` }, store)
}

export const connectAtom = (
  connection: Connection,
  atom: Atom,
  preventInit?: boolean
) => {
  const name = atom.toString()
  observedAtoms[name] = atom
  store[name] = atom.get()

  if (!preventInit) connection.init(store)
  if (!isSubscribed) subscribeAtoms(connection)

  return (value: unknown) => {
    updateAtomValue(connection, atom.toString(), value)
  }
}

/* For internal testing only */
export const disconnectAllConnections = () => {
  store = {}
  observedAtoms = {}
  isSubscribed = false
  unsubscribe?.()
}
