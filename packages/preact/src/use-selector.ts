import { useSyncExternalStore } from "preact/compat"
import { useRef, useEffect } from "preact/hooks"

import {
  memoizeFunction,
  toArray,
  type Subscribable,
  type InferValues,
} from "@yaasl/utils"

/** Compute a new value based on the state of an atom.
 *
 * @param atom Atom to be used.
 * @param combiner Function to retrieve the new value.
 * @param compare Function to compare the previous with a newer result. Defaults to a custom equality function.
 *
 * @returns The computed value.
 **/
export const useSelector = <
  TAtoms extends Subscribable | [Subscribable, ...Subscribable[]],
  TResult,
>(
  atoms: TAtoms,
  combiner: (...states: InferValues<TAtoms>) => TResult,
  compare?: (before: TResult, after: TResult) => boolean
) => {
  const memoizedCombiner = useRef(memoizeFunction(combiner, compare))

  useEffect(() => {
    // eslint-disable-next-line react-compiler/react-compiler
    memoizedCombiner.current.resultFn = combiner
    memoizedCombiner.current.compareResult = compare
  })

  const subscribe = (onStoreChange: () => void) => {
    const unsubscribers = toArray(atoms).map(atom =>
      atom.subscribe(onStoreChange)
    )
    return () => unsubscribers.forEach(fn => fn())
  }

  const getSnapshot = () => {
    const args = toArray(atoms).map(atom => atom.get()) as InferValues<TAtoms>

    return memoizedCombiner.current(...args)
  }

  return useSyncExternalStore(subscribe, getSnapshot)
}
