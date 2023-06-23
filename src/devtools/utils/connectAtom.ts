import { Atom, Store } from "../../core"
import { ConnectionResponse } from "../redux-devtools"

/* Cache of the current value of all atoms. (Record<storeName, Record<atomName, atomValue>>) */
let cache = new WeakMap<Store, Record<string, unknown | undefined>>()
let observedAtoms = new Set<Atom>()
let observedStores = new Set<Store>()
let subscribedStores = new WeakMap<Store, (() => void) | undefined>()

const setCachedValue = (store: Store, atom: Atom, value: unknown) => {
  const existing = cache.get(store)
  if (!existing) {
    cache.set(store, { [atom.toString()]: value })
  } else {
    existing[atom.toString()] = value
  }
}

const getCachedValue = (store: Store, atom: Atom) => {
  const existing = cache.get(store)
  if (!existing) return undefined
  return existing[atom.toString()]
}

const synchronize = (store: Store, state: Record<string, unknown>) =>
  Array.from(observedAtoms).filter(atom => {
    const atomName = atom.toString()
    if (!(atomName in state)) return false
    const newValue = state[atomName]
    const cachedValue = getCachedValue(store, atom)
    if (newValue === cachedValue) return false

    setCachedValue(store, atom, newValue)
    store.set(atom, newValue)
    return true
  })

const getDefaultState = () =>
  Array.from(observedAtoms).reduce<Record<string, unknown>>((result, atom) => {
    result[atom.toString()] = atom.defaultValue
    return result
  }, {})

const subscribeStore = (store: Store, connection: ConnectionResponse) =>
  connection.subscribe(action => {
    const { payload } = action
    const nextState = !action.state
      ? null
      : // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        (JSON.parse(action.state) as Record<string, unknown>)

    switch (payload?.type) {
      case "JUMP_TO_ACTION":
      case "ROLLBACK":
        if (!nextState) return
        synchronize(store, nextState)
        break

      case "RESET":
        synchronize(store, getDefaultState())
        break

      case "COMMIT":
        connection.init(cache.get(store))
        break

      case "IMPORT_STATE":
        payload.nextLiftedState.computedStates.forEach(({ state }) => {
          const changedKeys = synchronize(store, state)
          changedKeys.forEach(atom =>
            connection.send(
              { type: `${atom.toString()}/SET` },
              cache.get(store)
            )
          )
        })
        break
    }
  })

export const connectAtom = (
  store: Store,
  connection: ConnectionResponse,
  atom: Atom,
  preventInit?: boolean
) => {
  observedAtoms.add(atom)
  setCachedValue(store, atom, store.get(atom))

  if (!observedStores.has(store)) {
    if (!preventInit) connection.init(cache.get(store))
    const unsubscribe = subscribeStore(store, connection)
    subscribedStores.set(store, unsubscribe)
    observedStores.add(store)
  }

  return (value: unknown) => {
    setCachedValue(store, atom, value)
    connection.send({ type: `${atom.toString()}/SET` }, cache.get(store))
  }
}

/* For internal testing only */
export const disconnectAllConnections = () => {
  cache = new WeakMap()
  observedAtoms = new Set()

  observedStores.forEach(store => subscribedStores.get(store)?.())
  subscribedStores = new WeakMap()
  observedStores = new Set()
}
