import { useCallback, SetStateAction } from "react"

import { useStatefulValue } from "./useStatefulValue"
import { Atom, Stateful } from "../core"

export const useAtomValue = <ValueType>(atom: Stateful<ValueType>) =>
  useStatefulValue(atom)

export const useSetAtom = <ValueType>(atom: Atom<ValueType>) =>
  useCallback((next: SetStateAction<ValueType>) => atom.set(next), [atom])

/** Use an atom's value and setter within the react lifecycle.
 *'
 * @param atom Atom to be used for the state
 *
 * @returns A state value and state setter for the atom
 */
export const useAtom = <ValueType>(atom: Atom<ValueType>) => {
  const state = useAtomValue(atom)
  const setState = useSetAtom(atom)

  return [state, setState] as const
}
