type Dispatch<Action> = (value: Action) => void

export interface Atom<T> {
  get: () => T
  set: (value: T) => void
  subscribe: (action: Dispatch<T>) => void
  unsubscribe: (action: Dispatch<T>) => void
}

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
