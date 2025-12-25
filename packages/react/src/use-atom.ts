import { useState, useEffect, useSyncExternalStore } from "react"

import type { Stateful } from "@yaasl/core"
import type { Subscribable } from "@yaasl/utils"

/** Use an atom's value in the React lifecycle.
 *
 * @param atom Atom to be used.
 *
 * @returns The atom's value.
 **/
export const useAtom = <ValueType>(atom: Subscribable<ValueType>) =>
  useSyncExternalStore(
    set => atom.subscribe(set),
    () => atom.get(),
    () => atom.get()
  )

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
