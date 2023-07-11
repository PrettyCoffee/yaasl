import { useEffect, useRef, useState } from "react"

import { Stateful } from "../core"

export const useStatefulValue = <ValueType>(atom: Stateful<ValueType>) => {
  const [state, setState] = useState(atom.get())
  const unsubscribe = useRef<() => void>(() => null)

  useEffect(() => {
    unsubscribe.current()
    unsubscribe.current = atom.subscribe(setState)
    return () => unsubscribe.current()
  }, [atom])

  return state
}
