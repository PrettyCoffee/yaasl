import { Dispatch, UnknownObject } from "./utilTypes"

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

export interface AtomTypesLookup<
  InternalValue = unknown,
  GetterResult = unknown,
  SetterArg = unknown,
  Extension = UnknownObject
> {
  value: InternalValue
  getResult: GetterResult
  setArg: SetterArg
  /** Typescript has a hard time infering the extension keys, so we need to exclude the basic keys */
  extension: Omit<Extension, keyof AnyAtom<unknown>>
}

export type InferAtom<T> = T extends AnyAtom<
  infer InternalValue,
  infer GetterResult,
  infer SetterArg,
  infer Extension
>
  ? AtomTypesLookup<InternalValue, GetterResult, SetterArg, Extension>
  : never

export type InferAtomValue<T> = InferAtom<T>["value"]
