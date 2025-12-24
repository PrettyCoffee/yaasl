import { act, renderHook } from "@testing-library/react"
import { createAtom } from "@yaasl/core"
import { it, describe, expect } from "vitest"

import { useSelector } from "./use-selector"

const defaultValue = { nested: { value: "default-value" } }
const nextValue = { nested: { value: "next-value" } }

describe("Test useSelector", () => {
  it("Returns value with useAtom", () => {
    const testAtom = createAtom({ defaultValue })
    const { result } = renderHook(() =>
      useSelector(testAtom, state => state.nested.value)
    )
    expect(result.current).toBe("default-value")

    act(() => testAtom.set(nextValue))
    expect(result.current).toBe("next-value")
  })

  it("Uses a stable value for objects", () => {
    const testAtom = createAtom({ defaultValue })
    const { result, rerender } = renderHook(() =>
      useSelector(testAtom, state =>
        // create new object reference on each rerender
        ({ ...state.nested })
      )
    )
    expect(result.current).not.toBe(defaultValue.nested)
    expect(result.current).toStrictEqual(defaultValue.nested)

    const reference = result.current
    act(() => rerender())
    // keeps object reference of previous render if value didn't change
    expect(result.current).toBe(reference)

    act(() => {
      testAtom.set(nextValue)
    })
    expect(result.current).not.toBe(reference)
    expect(result.current).not.toBe(nextValue.nested)
    expect(result.current).toStrictEqual(nextValue.nested)
  })
})
