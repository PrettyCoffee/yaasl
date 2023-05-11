import { UnknownObject } from "./utils/utilTypes"

type Dispatch<Action> = (value: Action) => void

export type AnyAtom<
  InternalValue,
  GetterResult = InternalValue,
  SetterArg = InternalValue,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Extension extends UnknownObject = {},
  Action = Dispatch<InternalValue>
> = Extension & {
  get: () => GetterResult
  set: (value: SetterArg) => void
  subscribe: (action: Action) => void
  unsubscribe: (action: Action) => void
}

export type Atom<AtomValue = unknown> = AnyAtom<AtomValue>

export const createAtom = <AtomValue>(
  initialValue: AtomValue
): Atom<AtomValue> => {
  let state: AtomValue = initialValue

  let subscriptions: Dispatch<AtomValue>[] = []
  const subscribe = (action: Dispatch<AtomValue>) => subscriptions.push(action)
  const unsubscribe = (action: Dispatch<AtomValue>) => {
    subscriptions = subscriptions.filter(current => current !== action)
  }
  const callSubscriptions = (value: AtomValue) =>
    subscriptions.forEach(action => action(value))

  const getValue = () => state
  const setValue = (value: AtomValue) => {
    if (value === state) return

    state = value
    callSubscriptions(value)
  }

  return {
    get: getValue,
    set: setValue,
    subscribe,
    unsubscribe,
  }
}
