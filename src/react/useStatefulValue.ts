import { useSyncExternalStore } from "react"

import { Stateful } from "../core"

export const useStatefulValue = <ValueType>(atom: Stateful<ValueType>) =>
  useSyncExternalStore(
    set => atom.subscribe(set),
    () => atom.get()
  )
