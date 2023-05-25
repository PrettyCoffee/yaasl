import { Dispatch, UnknownObject } from "../utils/utilTypes"

export type AnyAtom<
  InternalValue,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Extension extends UnknownObject = {},
  Action = Dispatch<InternalValue>
> = Extension & {
  toString: () => string
  initialValue: InternalValue
  get: () => InternalValue
  set: Dispatch<InternalValue>
  subscribe: (action: Action) => void
  unsubscribe: (action: Action) => void
}

export interface AtomTypesLookup<
  InternalValue = unknown,
  Extension = UnknownObject
> {
  value: InternalValue
  /** Typescript has a hard time infering the extension keys, so we need to exclude the basic keys */
  extension: Omit<Extension, keyof AnyAtom<unknown>>
}

export type InferAtom<T> = T extends AnyAtom<
  infer InternalValue,
  infer Extension
>
  ? AtomTypesLookup<InternalValue, Extension>
  : never

export type InferAtomValue<T> = InferAtom<T>["value"]
