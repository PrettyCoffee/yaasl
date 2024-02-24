import { Derive } from "@yaasl/core"

import { useStatefulValue } from "./useStatefulValue"

/** Use a derive atom's value in the preact lifecycle.
 *
 * @param derive Derive atom to be used.
 *
 * @returns A stateful value.
 **/
export const useDeriveValue = <ValueType>(derive: Derive<ValueType>) =>
  useStatefulValue(derive)
