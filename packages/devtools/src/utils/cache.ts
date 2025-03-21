import type { Atom } from "@yaasl/core"

let storeCache: Record<string, unknown> = {}

const setAtomValue = (atom: Atom, value: unknown) =>
  (storeCache[atom.name] = value)

const getAtomValue = (atom: Atom) => storeCache[atom.name]

export const cache = {
  getAtomValue,
  setAtomValue,
  getStore: () => storeCache,
  reset: () => (storeCache = {}),
}
