import { useEffect, useState } from "react"

import { AnyAtom, InferAtom, AtomTypesLookup } from "../core"

export const useAtomValue = <
  Atom extends AnyAtom<AtomTypes["value"], AtomTypes["extension"]>,
  AtomTypes extends AtomTypesLookup = InferAtom<Atom>
>(
  atom: Atom
) => {
  const [state, setState] = useState(atom.get())

  useEffect(() => {
    atom.subscribe(setState)
    return () => atom.unsubscribe(setState)
  }, [atom])

  return state
}

export const useSetAtom = <
  Atom extends AnyAtom<AtomTypes["value"], AtomTypes["extension"]>,
  AtomTypes extends AtomTypesLookup = InferAtom<Atom>
>(
  atom: Atom
) => {
  return atom.set
}

export const useAtom = <
  Atom extends AnyAtom<AtomTypes["value"], AtomTypes["extension"]>,
  AtomTypes extends AtomTypesLookup = InferAtom<Atom>
>(
  atom: Atom
) => {
  const state = useAtomValue(atom)
  const setState = useSetAtom(atom)

  return [state, setState] as const
}
