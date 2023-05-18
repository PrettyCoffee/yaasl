import { AnyAtom, AtomTypesLookup, InferAtom } from "../utils/atomTypes"
import { Prettify, UnknownObject } from "../utils/utilTypes"

interface GenericMiddleware<InternalValue, Extension extends UnknownObject> {
  onGet?: (value: InternalValue) => void
  onSet?: (value: InternalValue) => void
  extension?: Extension
}

type MiddlewareAtom<
  ThisAtom extends AnyAtom<unknown, UnknownObject>,
  Extension
> = Prettify<ThisAtom & Omit<Extension, keyof ThisAtom>>

export const applyMiddleware = <
  ThisAtom extends AnyAtom<AtomTypes["value"], AtomTypes["extension"]>,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Extension extends UnknownObject = {},
  AtomTypes extends AtomTypesLookup = InferAtom<ThisAtom>,
  Result = MiddlewareAtom<ThisAtom, Extension>
>(
  atom: ThisAtom,
  middleware: Prettify<GenericMiddleware<AtomTypes["value"], Extension>>
): Result => {
  const { onGet, onSet, extension = {} } = middleware

  const get = (): AtomTypes["value"] => {
    const value = atom.get()
    onGet?.(value)
    return value
  }

  const set = (value: AtomTypes["value"]) => {
    onSet?.(value)
    atom.set(value)
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    ...extension,
    ...atom,
    get,
    set,
  } as Result
}
