import { Derive } from "@yaasl/core"

import { useSetStateful, useStatefulValue } from "./useStateful"

/** Use a derive atom's value in the react lifecycle.
 *
 * @param derive Derive atom to be used.
 *
 * @returns A stateful value.
 **/
export const useDeriveValue = <ValueType>(derive: Derive<ValueType>) =>
  useStatefulValue(derive)

/** Set a derive atom's value in the react lifecycle.
 *
 * @param derive Derive atom to be used.
 *
 * @returns A setter function for the derive atom.
 **/
export const useSetDerive = <ValueType>(derive: Derive<ValueType>) =>
  useSetStateful(derive)

/** Use a derive atom's value and setter in the react lifecycle.
 *
 * **Note:** Use `useDeriveValue` or `useSetDerive` to use value or setter separately.
 *
 * @param derive Derive atom to be used.
 *
 * @returns [value, setValue]
 **/
export const useDerive = <ValueType>(derive: Derive<ValueType>) => {
  const state = useDeriveValue(derive)
  const setState = useSetDerive(derive)

  return [state, setState] as const
}
