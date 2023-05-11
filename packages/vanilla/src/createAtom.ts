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

export type Atom<T> = AnyAtom<T>

export const createAtom = <T>(initialValue: T): Atom<T> => {
  let state: T = initialValue

  let subscriptions: Dispatch<T>[] = []
  const subscribe = (action: Dispatch<T>) => subscriptions.push(action)
  const unsubscribe = (action: Dispatch<T>) => {
    subscriptions = subscriptions.filter(current => current !== action)
  }
  const callSubscriptions = (value: T) =>
    subscriptions.forEach(action => action(value))

  const getValue = () => state
  const setValue = (value: T) => {
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
