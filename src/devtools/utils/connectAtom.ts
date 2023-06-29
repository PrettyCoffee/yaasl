import { cache } from "./cache"
import { updates } from "./updates"
import { Atom, Store } from "../../core"
import { ConnectionResponse } from "../redux-devtools"

/* Cache of the current value of all atoms. (Record<storeName, Record<atomName, atomValue>>) */
let observedAtoms = new Set<Atom>()
let observedStores = new Set<Store>()
let subscribedStores = new WeakMap<Store, (() => void) | undefined>()

const synchronize = (store: Store, state: Record<string, unknown>) => {
  updates.pause(store)
  const changedKeys = Array.from(observedAtoms).filter(atom => {
    const atomName = atom.toString()
    if (!(atomName in state)) return false
    const newValue = state[atomName]
    const cachedValue = cache.getAtomValue(store, atom)
    if (newValue === cachedValue) return false

    cache.setAtomValue(store, atom, newValue)
    store.set(atom, newValue)
    return true
  })
  updates.resume(store)
  return changedKeys
}

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
        connection.init(cache.getStore(store))
        break

      case "IMPORT_STATE":
        payload.nextLiftedState.computedStates.forEach(({ state }) => {
          const changedKeys = synchronize(store, state)
          changedKeys.forEach(atom =>
            connection.send(
              { type: `${atom.toString()}/SET` },
              cache.getStore(store)
            )
          )
        })
        break
    }
  })

export const connectAtom = (
  store: Store,
  connection: ConnectionResponse,
  atom: Atom
) => {
  observedAtoms.add(atom)
  cache.setAtomValue(store, atom, store.get(atom))

  if (!observedStores.has(store)) {
    connection.init(cache.getStore(store))
    const unsubscribe = subscribeStore(store, connection)
    subscribedStores.set(store, unsubscribe)
    observedStores.add(store)
  }

  return (value: unknown) => {
    cache.setAtomValue(store, atom, value)
    connection.send({ type: `${atom.toString()}/SET` }, cache.getStore(store))
  }
}

/* For internal testing only */
export const disconnectAllConnections = () => {
  cache.reset()
  observedAtoms = new Set()

  observedStores.forEach(store => subscribedStores.get(store)?.())
  subscribedStores = new WeakMap()
  observedStores = new Set()
}
