import { AnyAtom } from "./atomTypes"
import { freeze } from "../utils/freeze"
import { Dispatch } from "../utils/utilTypes"

let key = 0

export type Atom<AtomValue = unknown> = AnyAtom<AtomValue>

export const createAtom = <AtomValue>(
  initialValue: AtomValue,
  name = `atom-${++key}`
): Readonly<Atom<AtomValue>> => {
  let state: AtomValue = initialValue

  const subscriptions = new Set<Dispatch<AtomValue>>()
  const subscribe = (action: Dispatch<AtomValue>) => subscriptions.add(action)
  const unsubscribe = (action: Dispatch<AtomValue>) => {
    subscriptions.delete(action)
  }
  const callSubscriptions = (value: AtomValue) =>
    subscriptions.forEach(action => action(value))

  const getValue = () => state
  const setValue = (value: AtomValue) => {
    if (value === state) return

    state = value
    callSubscriptions(value)
  }

  return freeze({
    toString: () => name,
    initialValue,
    get: getValue,
    set: setValue,
    subscribe,
    unsubscribe,
  })
}
