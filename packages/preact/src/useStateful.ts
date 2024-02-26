import { Stateful } from "@yaasl/core"
import { SetStateAction, consoleMessage } from "@yaasl/utils"
import { useState, useEffect, useRef, useCallback } from "preact/hooks"

export const useStatefulValue = <ValueType>(atom: Stateful<ValueType>) => {
  const [state, setState] = useState(atom.get())
  const unsubscribe = useRef<() => boolean>(() => true)

  useEffect(() => {
    unsubscribe.current()
    unsubscribe.current = atom.subscribe(setState)

    return () => unsubscribe.current()
  }, [atom])

  return state
}

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
