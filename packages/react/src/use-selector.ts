import { useEffect, useRef, useSyncExternalStore } from "react"

import { Stateful } from "@yaasl/core"
import { memoizeFunction, toArray } from "@yaasl/utils"

type InferValuesFromAtoms<TAtoms, TValues extends unknown[] = []> =
  TAtoms extends Stateful<infer TValue>
    ? [...TValues, TValue]
    : TAtoms extends [Stateful<infer Value>, ...infer Rest]
      ? InferValuesFromAtoms<Rest, [...TValues, Value]>
      : TValues

/** Compute a new value based on the state of an atom.
 *
 * @param atom Atom to be used.
 * @param combiner Function to retrieve the new value.
 * @param compare Function to compare the previous with a newer result. Defaults to a custom equality function.
 *
 * @returns The computed value.
 **/
export const useSelector = <
  TAtoms extends Stateful | [Stateful, ...Stateful[]],
  TResult,
>(
  atoms: TAtoms,
  combiner: (...states: InferValuesFromAtoms<TAtoms>) => TResult,
  compare?: (before: TResult, after: TResult) => boolean
) => {
  const memoizedCombiner = useRef(memoizeFunction(combiner, compare))

  useEffect(() => {
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
    const args = toArray(atoms).map(atom =>
      atom.get()
    ) as InferValuesFromAtoms<TAtoms>

    return memoizedCombiner.current(...args)
  }

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
