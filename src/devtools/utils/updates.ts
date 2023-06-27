import { Store } from "../../core"

const pausedStores = new Set<Store>()

export const updates = {
  pause: (store: Store) => pausedStores.add(store),
  resume: (store: Store) => pausedStores.delete(store),
  isPaused: (store: Store) => pausedStores.has(store),
}
