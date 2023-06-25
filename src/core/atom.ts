import { Middleware } from "../middleware"
import { freeze } from "../utils/freeze"

export interface AtomConfig<AtomValue> {
  /** Value that will be returned if the atom is not defined in the store */
  defaultValue: AtomValue
  /** Name of the atom. Must be unique among all atoms. */
  name?: string
  /** Middleware that will be applied on the atom */
  middleware?: Middleware<any>[]
}

export interface Atom<AtomValue = unknown> {
  /** Value that will be returned if the atom is not defined in the store */
  defaultValue: AtomValue
  /** Returns the unique name of the atom */
  toString: () => string
  /** Middleware that will be applied on the atom */
  middleware: Middleware<any>[]
}

export type UnknownAtom = Atom

export type InferAtomValue<Atom extends UnknownAtom> = Atom["defaultValue"]

let key = 0

/** Create atoms to be used in combination with a store.
 *
 * @param config.defaultValue Value that will be returned if the atom is not defined in the store
 * @param config.name Name of the atom. Must be unique among all atoms. Defaults to "atom-{number}".
 * @param config.middleware Middleware that will be applied on the atom
 *
 * @returns An atom object
 **/
export const atom = <AtomValue>({
  defaultValue,
  name = `atom-${++key}`,
  middleware = [],
}: AtomConfig<AtomValue>): Readonly<Atom<AtomValue>> =>
  freeze({
    defaultValue,
    toString: () => name,
    middleware,
  })
