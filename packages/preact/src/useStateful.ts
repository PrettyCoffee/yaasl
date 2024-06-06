import { Stateful } from "@yaasl/core"
import { Updater, consoleMessage } from "@yaasl/utils"
import { useState, useEffect, useRef, useCallback } from "preact/hooks"

export const useStatefulValue = <State>(atom: Stateful<State>) => {
  const [state, setState] = useState(atom.get())
  const unsubscribe = useRef<() => boolean>(() => true)

  useEffect(() => {
    unsubscribe.current()
    unsubscribe.current = atom.subscribe(setState)

    return () => unsubscribe.current()
  }, [atom])

  return state
}

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
