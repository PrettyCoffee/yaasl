import { cache } from "./cache"
import { updates } from "./updates"
import { Atom, Store } from "../../core"
import { ConnectionResponse } from "../redux-devtools"

let subscribedStores = new WeakMap<Store, (() => void) | undefined>()
let observedAtoms = new Set<Atom>()
let observedStores = new Set<Store>()

const synchronize = (store: Store, state: Record<string, unknown>) => {
  updates.pause(store)
  Array.from(observedAtoms).forEach(atom => {
    const atomName = atom.toString()
    if (!(atomName in state)) return

    const newValue = state[atomName]
    const cachedValue = cache.getAtomValue(store, atom)
    if (newValue === cachedValue) return

    cache.setAtomValue(store, atom, newValue)
    store.set(atom, newValue)
  })
  updates.resume(store)
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
      case "COMMIT":
        connection.init(cache.getStore(store))
        break

      case "JUMP_TO_ACTION":
      case "ROLLBACK":
        if (!nextState) return
        synchronize(store, nextState)
        break

      case "RESET":
        synchronize(store, getDefaultState())
        connection.send({ type: `RESET_ATOMS` }, cache.getStore(store))
        break

      case "IMPORT_STATE":
        payload.nextLiftedState.computedStates.forEach(({ state }) => {
          synchronize(store, state)
          connection.send({ type: `IMPORT_STORE` }, cache.getStore(store))
        })
        break
    }
  })

export const connectAtom = (
  connection: ConnectionResponse,
  store: Store,
  atom: Atom
) => {
  const storeIsSubscribed = cache.hasStore(store)
  const atomIsObserved = observedAtoms.has(atom)

  cache.setAtomValue(store, atom, atom.defaultValue)

  if (!atomIsObserved) {
    observedAtoms.add(atom)
  }

  if (!storeIsSubscribed) {
    connection.init(cache.getStore(store))
    const unsubscribe = subscribeStore(store, connection)
    subscribedStores.set(store, unsubscribe)
    observedStores.add(store)
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
