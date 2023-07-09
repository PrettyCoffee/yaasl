import { Atom, InferAtomValue, UnknownAtom } from "./atom"
import { freeze } from "../utils/freeze"
import { log } from "../utils/log"
import { Dispatch } from "../utils/utilTypes"

export type ActionType = "init" | "set" | "remove"
export interface ActionPayload<AtomValue = unknown> {
  type: ActionType
  value?: AtomValue
}

export type Action<AtomValue> = Dispatch<ActionPayload<AtomValue>>

export interface StoreConfig {
  /** Name of the store. Must be unique among all stores. Defaults to "store-{number}". */
  name?: string
}

type SetterFn<Atom extends UnknownAtom> = (
  previous: InferAtomValue<Atom>
) => InferAtomValue<Atom>

export type SetterOrValue<Atom extends UnknownAtom> =
  | InferAtomValue<Atom>
  | SetterFn<Atom>

export interface Store {
  /** Returns the unique name of the store */
  toString: () => string
  /** Check if the store has a value for the atom */
  has: (atom: Atom) => boolean
  /** Initialize the atom in the store */
  init: (atom: Atom) => void
  /** Returns the current value of the atom in the store.
   *  Defaults to the defaultValue.
   **/
  get: <Atom extends UnknownAtom>(atom: Atom) => InferAtomValue<Atom>
  /** Sets the value of the atom in the store */
  set: <Atom extends UnknownAtom>(
    atom: Atom,
    value: SetterOrValue<Atom>
  ) => void
  /** Removes the atoms value and subscriptions from the store */
  remove: <Atom extends UnknownAtom>(atom: Atom) => void
  /** Subscribes to value changes of the atom and returns a function to unsubscribe from the action */
  subscribe: <
    Atom extends UnknownAtom,
    ThisAction extends Action<InferAtomValue<Atom>>
  >(
    atom: Atom,
    action: ThisAction
  ) => () => void
  /** Unsubscribes from value changes */
  unsubscribe: <
    Atom extends UnknownAtom,
    ThisAction extends Action<InferAtomValue<Atom>>
  >(
    atom: Atom,
    action: ThisAction
  ) => void
}

let storeKey = 0

/** Create stores to store values of atoms.
 *
 * @param config.name Name of the store. Must be unique among all stores. Defaults to "store-{number}".
 *
 * @returns A store object
 **/
export const store = ({
  name = `store-${++storeKey}`,
}: StoreConfig = {}): Readonly<Store> => {
  const values = new WeakMap<UnknownAtom, unknown>()
  const subscriptions = new WeakMap<UnknownAtom, Set<Action<unknown>>>()

  const thisStore = {
    toString: () => name,
  }

  const notInitializedError = (atom: Atom) => {
    if (values.has(atom)) return
    log.error(
      `Initialize the atom "${atom.toString()}" in store "${name}" before using it.`
    )
  }

  const callActions = (type: ActionType, atom: Atom, value?: unknown) => {
    atom.middleware.forEach(({ actions, options }) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      actions[type]?.({ value, options, atom, store: thisStore as Store })
    )

    subscriptions.get(atom)?.forEach(action => action({ type, value }))
  }

  const has: Store["has"] = atom => values.has(atom)

  const init: Store["init"] = atom => {
    if (has(atom)) return
    values.set(atom, atom.defaultValue)
    callActions("init", atom, atom.defaultValue)
  }

  const get: Store["get"] = atom => {
    notInitializedError(atom)
    return values.get(atom)
  }
  const set: Store["set"] = (atom, setter) => {
    notInitializedError(atom)
    const previousValue = get(atom)
    const value = setter instanceof Function ? setter(previousValue) : setter
    if (previousValue === value) return

    values.set(atom, value)
    callActions("set", atom, value)
  }

  const remove: Store["remove"] = atom => {
    values.delete(atom)
    callActions("remove", atom)
    subscriptions.delete(atom)
  }

  const unsubscribe: Store["unsubscribe"] = (atom, action) =>
    subscriptions.get(atom)?.delete(action)

  const subscribe: Store["subscribe"] = (atom, action) => {
    subscriptions.has(atom)
      ? subscriptions.get(atom)?.add(action)
      : subscriptions.set(atom, new Set([action]))

    return () => unsubscribe(atom, action)
  }

  return freeze(
    Object.assign(thisStore, {
      has,
      init,
      get,
      set,
      remove,
      subscribe,
      unsubscribe,
    })
  )
}

/** Store to be used as default store. */
export const globalStore = store({ name: "global" })
