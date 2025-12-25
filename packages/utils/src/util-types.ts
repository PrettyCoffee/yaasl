export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type Dispatch<T> = (value: T) => void

export type SubscriberCallback<TValue = unknown> = (
  value: TValue,
  previous: TValue
) => void

export interface Subscribable<TValue = unknown> {
  didInit: PromiseLike<void> | boolean
  get: () => TValue
  subscribe: (cb: SubscriberCallback<TValue>) => () => void
}

type InferValuesRecursive<TAtoms, TValues extends unknown[] = []> =
  TAtoms extends Subscribable<infer TValue>
    ? [...TValues, TValue]
    : TAtoms extends [Subscribable<infer Value>, ...infer Rest]
      ? InferValuesRecursive<Rest, [...TValues, Value]>
      : TValues

export type InferValues<TAtoms extends Subscribable | Subscribable[]> =
  InferValuesRecursive<TAtoms>
