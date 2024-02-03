import { Derive } from "@yaasl/core"

import { useStatefulValue } from "./useStatefulValue"

/** Use a derived value in the react lifecycle.
 *
 * @param derived Derived instance to be used.
 *
 * @returns A stateful value.
 **/
export const useDerivedValue = <ValueType>(derived: Derive<ValueType>) =>
  useStatefulValue(derived)
