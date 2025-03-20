import { useState, useEffect } from "react"

import type { Stateful } from "@yaasl/core"

import { useSetStateful, useStatefulValue } from "./useStateful"

/** Use an atom's value in the React lifecycle.
 *
 * @param atom Atom to be used.
 *
 * @returns The atom's value.
 **/
export const useAtomValue = <ValueType>(atom: Stateful<ValueType>) =>
  useStatefulValue(atom)

/** Set an atom's value in the React lifecycle.
 *
 * @param atom Atom to be used.
 *
 * @returns A setter function for the atom.
 **/
export const useSetAtom = <ValueType>(atom: Stateful<ValueType>) =>
  useSetStateful(atom)

/** Use an atom's initialization state in the React lifecycle.
 *
 *  @param atom Atom to be used.
 *
 *  @returns A boolean indicating if the atom has finished initializing yet.
 **/
export const useAtomDidInit = <ValueType>(atom: Stateful<ValueType>) => {
  const [didInit, setDidInit] = useState(atom.didInit === true)

  useEffect(() => {
    if (typeof atom.didInit === "boolean") return
    void atom.didInit.then(() => setDidInit(true))
  }, [atom.didInit])

  return didInit
}

/** Use an atom's value and setter in the React lifecycle.
 *
 * @param atom Atom to be used.
 *
 * @returns [value, setValue, didInit]
 **/
export const useAtom = <ValueType>(atom: Stateful<ValueType>) => {
  const state = useAtomValue(atom)
  const setState = useSetAtom(atom)
  const didInit = useAtomDidInit(atom)

  return [state, setState, didInit] as const
}
