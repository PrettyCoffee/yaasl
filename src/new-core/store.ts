import { Atom, InferAtomValue, UnknownAtom } from "./atom"
import { freeze } from "../utils/freeze"
import { Dispatch } from "../utils/utilTypes"

export type ActionType = "INIT" | "SET" | "REMOVE"
export interface ActionPayload<AtomValue> {
  type: ActionType
  value?: AtomValue
}

export type Action<AtomValue> = Dispatch<ActionPayload<AtomValue>>

export interface StoreConfig {
  /** Name of the store. Must be unique among all atores. */
  name?: string
}

export interface Store {
  /** Returns the unique name of the store */
  toString: () => string
  /** Initialize the atom in the store */
  init: (atom: Atom) => void
  /** Returns the current value of the atom in the store.
   *  Defaults to the defaultValue.
   **/
  get: <Atom extends UnknownAtom>(atom: Atom) => InferAtomValue<Atom>
  /** Returns the value of the atom in the store */
  set: <Atom extends UnknownAtom>(
    atom: Atom,
    value: InferAtomValue<Atom>
  ) => void
  /** Removes the atoms value and subscriptions from the store */
  remove: <Atom extends UnknownAtom>(atom: Atom) => void
  /** Subscribes to value changes of the atom */
  subscribe: <
    Atom extends UnknownAtom,
    Action extends Dispatch<InferAtomValue<Atom>>
  >(
    atom: Atom,
    action: Action
  ) => void
  /** Unsubscribes from value changes */
  unsubscribe: <
    Atom extends UnknownAtom,
    Action extends Dispatch<InferAtomValue<Atom>>
  >(
    atom: Atom,
    action: Action
  ) => void
}

let storeKey = 0

export const store = ({
  name = `store-${++storeKey}`,
}: StoreConfig = {}): Readonly<Store> => {
  const values = new WeakMap<UnknownAtom, unknown>()
  const subscriptions = new WeakMap<UnknownAtom, Set<Action<unknown>>>()

  const store = {
    toString: () => name,
  }

  const callActions = (type: ActionType, atom: Atom, value?: unknown) => {
    const payload = type === "SET" ? { type, value } : { type }

    atom.middleware.forEach(({ hook, options }) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      hook({ ...payload, options, atom, store: store as unknown as Store })
    )
    subscriptions.get(atom)?.forEach(action => action(payload))
  }

  const init: Store["init"] = atom => {
    if (values.has(atom)) return
    values.set(atom, atom.defaultValue)
    callActions("INIT", atom, atom.defaultValue)
  }

  const get: Store["get"] = atom =>
    !values.has(atom) ? atom.defaultValue : values.get(atom)

  const set: Store["set"] = (atom, value) => {
    if (get(atom) === value) return

    values.set(atom, value)
    callActions("SET", atom, value)
  }

  const remove: Store["remove"] = atom => {
    values.delete(atom)
    callActions("REMOVE", atom)
    subscriptions.delete(atom)
  }

  const subscribe: Store["subscribe"] = (atom, action) =>
    subscriptions.has(atom)
      ? subscriptions.get(atom)?.add(action)
      : subscriptions.set(atom, new Set([action]))

  const unsubscribe: Store["unsubscribe"] = (atom, action) =>
    subscriptions.get(atom)?.delete(action)

  return freeze(
    Object.assign(store, {
      init,
      get,
      set,
      remove,
      subscribe,
      unsubscribe,
    })
  )
}

export const globalStore = store({ name: "global" })
