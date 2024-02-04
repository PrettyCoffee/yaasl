import { Stateful } from "@yaasl/core"
import { useState, useEffect, useRef } from "preact/hooks"

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
