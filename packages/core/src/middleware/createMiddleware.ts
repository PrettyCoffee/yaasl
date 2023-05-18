import { Atom } from "../createAtom"
import { AnyAtom, AtomTypesLookup, InferAtom } from "../utils/atomTypes"
import { Prettify, UnknownObject } from "../utils/utilTypes"

interface MiddlewareConfig<Options> {
  atom: UnknownAtom
  options: Options
}

type UnknownAtom = AnyAtom<unknown, UnknownObject>

type GetExtensionProp<
  Extension extends object | undefined,
  Config
> = Extension extends undefined
  ? { createExtension?: undefined }
  : {
      createExtension: Extension extends undefined
        ? undefined
        : (config: Config) => Extension
    }

type MiddlewareImplementation<
  Options,
  Extension extends object | undefined,
  Config = MiddlewareConfig<Options>
> = GetExtensionProp<Extension, Config> & {
  onInit?: (config: Config) => void
  onGet?: (value: unknown, config: Config) => void
  onSet?: (value: unknown, config: Config) => void
}

type MiddlewareAtom<AtomTypes extends AtomTypesLookup, Extension> = Prettify<
  AnyAtom<
    AtomTypes["value"],
    AtomTypes["extension"] & Omit<Extension, keyof Atom>
  >
>

export const createMiddleware =
  <Options = undefined, Extension extends object | undefined = undefined>(
    setup: MiddlewareImplementation<Options, Extension>
  ) =>
  <
    ThisAtom extends AnyAtom<AtomTypes["value"], AtomTypes["extension"]>,
    AtomTypes extends AtomTypesLookup = InferAtom<ThisAtom>
  >(
    ...args: Options extends undefined
      ? [ThisAtom, Options | undefined] | [ThisAtom]
      : [ThisAtom, Options]
  ): MiddlewareAtom<AtomTypes, Extension> => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const [atom, options] = args as [ThisAtom, Options]
    const config: MiddlewareConfig<Options> = {
      atom,
      options,
    }

    setup.onInit?.(config)

    const get = () => {
      const value = atom.get()
      setup.onGet?.(value, config)
      return value
    }

    const set = (value: Parameters<ThisAtom["set"]>) => {
      setup.onSet?.(value, config)
      atom.set(value)
    }

    const extension = setup.createExtension?.(config) ?? {}

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {
      ...extension,
      ...atom,
      get,
      set,
    } as ThisAtom & Extension
  }
