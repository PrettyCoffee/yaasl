import { useCallback, useEffect, useRef, useState } from "react"

import { useStoreProvider } from "./StoreProvider"
import { InferAtomValue, UnknownAtom, Action } from "../core"
import { SetterOrValue } from "../core/store"
import { Dispatch } from "../utils/utilTypes"

const useAtomSubscription = <Atom extends UnknownAtom>(
  atom: Atom,
  onChange: Dispatch<InferAtomValue<Atom>>
) => {
  const store = useStoreProvider()
  const unsubscribe = useRef<() => void>(() => null)

  useEffect(() => {
    unsubscribe.current()

    const action: Action<InferAtomValue<Atom>> = ({ type, value }) =>
      type === "SET" && onChange(value)

    store.subscribe(atom, action)

    unsubscribe.current = () => store.unsubscribe(atom, action)
    return unsubscribe.current
  }, [atom, onChange, store])
}

const useAtomSetup = <Atom extends UnknownAtom>(atom: Atom) => {
  const store = useStoreProvider()

  useEffect(() => {
    if (!store.has(atom)) store.init(atom)
  }, [atom, store])
}

export const useAtomValue = <Atom extends UnknownAtom>(atom: Atom) => {
  const store = useStoreProvider()
  const [state, setState] = useState(store.get(atom))

  // Must subscribe before setup
  useAtomSubscription(atom, setState)
  useAtomSetup(atom)

  return state
}

export const useSetAtom = <Atom extends UnknownAtom>(atom: Atom) => {
  const store = useStoreProvider()
  return useCallback(
    (setter: SetterOrValue<Atom>) => store.set(atom, setter),
    [atom, store]
  )
}

/** Use an atoms value and setter within the react lifecycle.
 *  Will use the globalStore by default or
 *  any store provided by a StoreProvider.
 *
 * @param atom Atom to be used for the state
 *
 * @returns A state value and state setter for the atom
 */
export const useAtom = <Atom extends UnknownAtom>(atom: Atom) => {
  const state = useAtomValue(atom)
  const setState = useSetAtom(atom)

  return [state, setState] as const
}
