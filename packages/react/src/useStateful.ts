import { useCallback, useSyncExternalStore, SetStateAction } from "react"

import { Stateful } from "@yaasl/core"
import { consoleMessage } from "@yaasl/utils"

export const useStatefulValue = <ValueType>(stateful: Stateful<ValueType>) =>
  useSyncExternalStore(
    set => stateful.subscribe(set),
    () => stateful.get()
  )

export const useSetStateful = <ValueType>(stateful: Stateful<ValueType>) =>
  useCallback(
    (next: SetStateAction<ValueType>) => {
      if (!("set" in stateful) || !(stateful.set instanceof Function)) {
        throw new Error(consoleMessage("Atom does not have a set method"))
      }
      stateful.set(next)
    },
    [stateful]
  )
