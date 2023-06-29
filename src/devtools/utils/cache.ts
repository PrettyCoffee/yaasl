import { Atom, Store } from "../../core"

let storeCache = new WeakMap<Store, Record<string, unknown | undefined>>()

const setAtomValue = (store: Store, atom: Atom, value: unknown) => {
  const existing = storeCache.get(store)
  if (!existing) {
    storeCache.set(store, { [atom.toString()]: value })
  } else {
    existing[atom.toString()] = value
  }
}

const getAtomValue = (store: Store, atom: Atom) => {
  const existing = storeCache.get(store)
  if (!existing) return undefined
  return existing[atom.toString()]
}

const getStoreState = (store: Store) => storeCache.get(store)

const hasStore = (store: Store) => storeCache.has(store)

export const cache = {
  getStore: getStoreState,
  getAtomValue,
  setAtomValue,
  hasStore,
  reset: () => (storeCache = new WeakMap()),
}
