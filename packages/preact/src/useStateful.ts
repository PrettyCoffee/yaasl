import { Stateful } from "@yaasl/core"
import { Updater, consoleMessage } from "@yaasl/utils"
import { useCallback } from "preact/hooks"
import { useSyncExternalStore } from "preact/compat"

export const useStatefulValue = <ValueType>(stateful: Stateful<ValueType>) =>
  useSyncExternalStore(
    set => stateful.subscribe(set),
    () => stateful.get()
  )

export const useSetStateful = <State>(stateful: Stateful<State>) =>
  useCallback(
    (next: Updater<State>) => {
      if (!("set" in stateful) || !(stateful.set instanceof Function)) {
        throw new Error(consoleMessage("Atom does not have a set method"))
      }
      stateful.set(next)
    },
    [stateful]
  )
