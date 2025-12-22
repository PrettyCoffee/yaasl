import { useSyncExternalStore } from "preact/compat"
import { useEffect, useState } from "preact/hooks"

import type { Stateful } from "@yaasl/core"

/** Use an atom's value in the preact lifecycle.
 *
 * @param atom Atom to be used.
 *
 * @returns A stateful value.
 **/
export const useAtom = <ValueType>(atom: Stateful<ValueType>) =>
  useSyncExternalStore(
    set => atom.subscribe(set),
    () => atom.get()
  )

/** Use an atom's initialization state in the preact lifecycle.
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
