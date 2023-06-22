import { freeze } from "../utils/freeze"

export interface AtomConfig<AtomValue> {
  /** Value that will be returned if the atom is not defined in the store */
  defaultValue: AtomValue
  /** Name of the atom. Must be unique among all atoms. */
  name?: string
}

export interface Atom<AtomValue = unknown> {
  /** Value that will be returned if the atom is not defined in the store */
  defaultValue: AtomValue
  /** Returns the unique name of the atom */
  toString: () => string
}

export type UnknownAtom = Atom

export type InferAtomValue<Atom extends UnknownAtom> = Atom["defaultValue"]

let key = 0

export const atom = <AtomValue>({
  defaultValue,
  name = `atom-${++key}`,
}: AtomConfig<AtomValue>): Readonly<Atom<AtomValue>> =>
  freeze({
    defaultValue,
    toString: () => name,
  })
