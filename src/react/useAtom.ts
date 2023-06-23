import { useCallback, useEffect, useRef, useState } from "react"

import { UnknownAtom, globalStore } from "../core"

export const useAtomValue = <Atom extends UnknownAtom>(atom: Atom) => {
  const [state, setState] = useState(globalStore.get(atom))
  const unsubscribe = useRef<() => void>(() => null)

  useEffect(() => {
    unsubscribe.current()

    if (!globalStore.has(atom)) globalStore.init(atom)

    globalStore.subscribe(
      atom,
      ({ type, value }) => type === "SET" && setState(value)
    )

    unsubscribe.current = () => globalStore.unsubscribe(atom, setState)
    return unsubscribe.current
  }, [atom])

  return state
}

export const useSetAtom = <Atom extends UnknownAtom>(atom: Atom) => {
  return useCallback(
    (value: Atom["defaultValue"]) => globalStore.set(atom, value),
    [atom]
  )
}

export const useAtom = <Atom extends UnknownAtom>(atom: Atom) => {
  const state = useAtomValue(atom)
  const setState = useSetAtom(atom)

  return [state, setState] as const
}
