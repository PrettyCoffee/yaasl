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

  it("Accepts multiple atoms", () => {
    const value = createAtom({ defaultValue: 1 })
    const factor = createAtom({ defaultValue: 1 })

    const { result } = renderHook(() =>
      useSelector(
        [value, factor],
        (value: number, factor: number) => factor * value
      )
    )
    expect(result.current).toBe(1)

    act(() => value.set(21))
    expect(result.current).toBe(21)

    act(() => factor.set(2))
    expect(result.current).toBe(42)
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

  it("Uses latest version of selector function", () => {
    const defaultValue = { a: "value a", b: "value b" }
    const testAtom = createAtom({ defaultValue })

    const selectorA = (state: typeof defaultValue) => state.a
    const selectorB = (state: typeof defaultValue) => state.b

    const { result, rerender } = renderHook(
      (selector: (state: typeof defaultValue) => string) =>
        useSelector(testAtom, selector),
      { initialProps: selectorA }
    )

    expect(result.current).toBe("value a")
    act(() => {
      rerender(selectorB)
    })
    expect(result.current).toBe("value b")
  })
})
