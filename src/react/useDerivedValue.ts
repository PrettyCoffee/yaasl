import { useStatefulValue } from "./useStatefulValue"
import { Derive } from "../core"

export const useDerivedValue = <ValueType>(derived: Derive<ValueType>) =>
  useStatefulValue(derived)
