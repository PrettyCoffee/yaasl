import { AnyAtom, AtomTypesLookup, InferAtom } from "./utils/atomTypes"
import {
  Fn,
  InferFnArg,
  InferFnResult,
  Prettify,
  UnknownObject,
} from "./utils/utilTypes"

interface GenericMiddleware<Getter, Setter, Extension extends UnknownObject> {
  onGet?: Getter
  onSet?: Setter
  extension?: Extension
}

type MiddlewareAtom<
  ParentTypes extends AtomTypesLookup,
  GetterResult,
  SetterArg,
  Extension
> = Prettify<
  AnyAtom<
    ParentTypes["value"],
    GetterResult extends never ? ParentTypes["getResult"] : GetterResult,
    SetterArg extends never ? ParentTypes["setArg"] : SetterArg,
    ParentTypes["extension"] & Extension
  >
>

export const applyMiddleware = <
  ParentAtom extends AnyAtom<
    ParentTypes["value"],
    ParentTypes["getResult"],
    ParentTypes["setArg"],
    ParentTypes["extension"]
  >,
  Getter extends Fn<[ParentTypes["getResult"]], GetterResult>,
  Setter extends Fn<[SetterArg], ParentTypes["setArg"]>,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Extension extends UnknownObject = {},
  ParentTypes extends AtomTypesLookup = InferAtom<ParentAtom>,
  GetterResult = InferFnResult<Getter, ParentTypes["getResult"]>,
  SetterArg = InferFnArg<Setter, ParentTypes["setArg"]>
>(
  atom: ParentAtom,
  middleware: Prettify<GenericMiddleware<Getter, Setter, Extension>>
): MiddlewareAtom<ParentTypes, GetterResult, SetterArg, Extension> => {
  const { get: atomGet, set: atomSet, ...delegated } = atom
  const { onGet, onSet, extension = {} } = middleware

  const get = (): GetterResult => {
    const value = atomGet()

    if (!onGet)
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return value as unknown as GetterResult

    return onGet(value)
  }

  const set = (value: SetterArg) => {
    if (!onSet) {
      atomSet(value)
      return
    }

    atomSet(onSet(value))
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    ...delegated,
    ...extension,
    get,
    set,
  } as MiddlewareAtom<ParentTypes, GetterResult, SetterArg, Extension>
}
