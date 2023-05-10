import { useEffect, useState } from "react"

// eslint-disable-next-line import/no-extraneous-dependencies -- is a peerDependency
import { Atom } from "@yaal/vanilla"

export const useAtomValue = <T>(atom: Atom<T>) => {
  const [state, setState] = useState(atom.get())

  useEffect(() => {
    atom.subscribe(setState)
    return () => atom.unsubscribe(setState)
  }, [atom])

  return state
}

export const useSetAtom = <T>(atom: Atom<T>) => {
  return atom.set
}

export const useAtom = <T>(atom: Atom<T>) => {
  const state = useAtomValue(atom)
  const setState = useSetAtom(atom)

  return [state, setState] as const
}
