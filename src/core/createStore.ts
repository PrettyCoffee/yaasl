import { AnyAtom, InferAtomValue } from "./atomTypes"
import { freeze } from "../utils/freeze"
import { Dispatch, UnknownObject } from "../utils/utilTypes"

type UnknownAtom<AtomValue = unknown> = AnyAtom<AtomValue, UnknownObject>
type ValueStore = WeakMap<UnknownAtom<any>, unknown>
type SubscriptionStore = WeakMap<UnknownAtom<any>, Set<Dispatch<any>>>

export const createStore = () => {
  const store: ValueStore = new WeakMap()
  const subscriptions: SubscriptionStore = new WeakMap()

  const get = <
    Atom extends UnknownAtom<AtomValue>,
    AtomValue = InferAtomValue<Atom>
  >(
    atom: Atom
  ): AtomValue =>
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    (store.get(atom) ?? atom.initialValue) as AtomValue

  const set = <
    Atom extends UnknownAtom<AtomValue>,
    AtomValue = InferAtomValue<Atom>
  >(
    atom: Atom,
    value: AtomValue
  ) => {
    if (get(atom) === value) return

    const actions = subscriptions.get(atom)
    actions?.forEach(action => action(value))
    store.set(atom, value)
  }

  const remove = <
    Atom extends UnknownAtom<AtomValue>,
    AtomValue = InferAtomValue<Atom>
  >(
    atom: Atom
  ) => {
    store.delete(atom)
    subscriptions.delete(atom)
  }

  const subscribe = <
    Atom extends UnknownAtom<AtomValue>,
    Action extends Dispatch<AtomValue>,
    AtomValue = InferAtomValue<Atom>
  >(
    atom: Atom,
    action: Action
  ) => {
    const actions = subscriptions.get(atom) ?? new Set()
    if (actions.has(action)) return

    actions.add(action)
    subscriptions.set(atom, actions)
  }

  const unsubscribe = <
    Atom extends UnknownAtom<AtomValue>,
    Action extends Dispatch<AtomValue>,
    AtomValue = InferAtomValue<Atom>
  >(
    atom: Atom,
    action: Action
  ) => {
    const actions = subscriptions.get(atom)
    if (!actions?.has(action)) return

    actions.delete(action)
    subscriptions.set(atom, actions)
  }

  return freeze({
    get,
    set,
    remove,
    subscribe,
    unsubscribe,
  })
}

export const globalStore = createStore()
