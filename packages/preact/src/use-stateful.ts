import { useSyncExternalStore } from "preact/compat"
import { useCallback } from "preact/hooks"

import type { Stateful } from "@yaasl/core"
import { Updater, consoleMessage } from "@yaasl/utils"

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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      stateful.set(next)
    },
    [stateful]
  )
