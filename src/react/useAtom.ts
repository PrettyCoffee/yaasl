import { useCallback, SetStateAction } from "react"

import { useStatefulValue } from "./useStatefulValue"
import { Atom, Stateful } from "../core"

/** Use an atom's value in the react lifecycle.
 *
 * @param atom Atom to be used.
 *
 * @returns A stateful value.
 **/
export const useAtomValue = <ValueType>(atom: Stateful<ValueType>) =>
  useStatefulValue(atom)

/** Set an atom's value in the react lifecycle.
 *
 * @param atom Atom to be used.
 *
 * @returns A setter function for the atom.
 **/
export const useSetAtom = <ValueType>(atom: Atom<ValueType>) =>
  useCallback((next: SetStateAction<ValueType>) => atom.set(next), [atom])

/** Use an atom's value and setter in the react lifecycle.
 *
 * **Note:** Use `useAtomValue` or `useSetAtom` to use value or setter separately.
 *
 * @param atom Atom to be used.
 *
 * @returns A state value and state setter for the atom.
 **/
export const useAtom = <ValueType>(atom: Atom<ValueType>) => {
  const state = useAtomValue(atom)
  const setState = useSetAtom(atom)

  return [state, setState] as const
}
