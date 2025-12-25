import { useEffect, useRef, useSyncExternalStore } from "react"

import { Stateful } from "@yaasl/core"
import { memoizeFunction } from "@yaasl/utils"

type InferValuesFromAtoms<TAtoms, TValues extends unknown[] = []> =
  TAtoms extends Stateful<infer TValue>
    ? [...TValues, TValue]
    : TAtoms extends [Stateful<infer Value>, ...infer Rest]
      ? InferValuesFromAtoms<Rest, [...TValues, Value]>
      : TValues

/** Compute a new value based on the state of an atom.
 *
 * @param atom Atom to be used.
 * @param selector Function to retrieve the new value.
 * @param compare Function to compare the previous with a newer result. Defaults to a custom equality function.
 *
 * @returns The computed value.
 **/
export const useSelector = <
  TAtoms extends Stateful | [Stateful, ...Stateful[]],
  TResult,
>(
  atoms: TAtoms,
  selector: (...states: InferValuesFromAtoms<TAtoms>) => TResult,
  compare?: (before: TResult, after: TResult) => boolean
) => {
  const memoizedSelector = useRef(memoizeFunction(selector, compare))

  useEffect(() => {
    memoizedSelector.current.resultFn = selector
    memoizedSelector.current.compareResult = compare
  })

  const subscribe = (onStoreChange: () => void) => {
    const atomArray = [atoms].flat()
    const unsubscribers = atomArray.map(atom => atom.subscribe(onStoreChange))
    return () => unsubscribers.forEach(fn => fn())
  }

  const getSnapshot = () => {
    const atomArray = [atoms].flat()
    const args = atomArray.map(atom =>
      atom.get()
    ) as InferValuesFromAtoms<TAtoms>

    return memoizedSelector.current(...args)
  }

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
