import { useSyncExternalStore } from "preact/compat"
import { useRef, useEffect } from "preact/hooks"

import { Stateful } from "@yaasl/core"
import { memoizeFunction } from "@yaasl/utils"

/** Compute a new value based on the state of an atom.
 *
 * @param atom Atom to be used.
 * @param selector Function to retrieve the new value.
 * @param compare Function to compare the previous with a newer result. Defaults to a custom equality function.
 *
 * @returns The computed value.
 **/
export const useSelector = <TState, TResult>(
  atom: Stateful<TState>,
  selector: (state: TState) => TResult,
  compare?: (before: TResult, after: TResult) => boolean
) => {
  const memoizedSelector = useRef(memoizeFunction(selector, compare))

  useEffect(() => {
    // eslint-disable-next-line react-compiler/react-compiler
    memoizedSelector.current.resultFn = selector
    memoizedSelector.current.compareResult = compare
  })

  return useSyncExternalStore(
    onStoreChange => atom.subscribe(onStoreChange),
    () => memoizedSelector.current(atom.get())
  )
}
