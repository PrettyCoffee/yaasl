import { act, renderHook } from "@testing-library/react"
import { createAtom, createDerived } from "@yaasl/core"
import { it, describe, expect } from "vitest"

import { useAtom } from "./use-atom"

const defaultValue = "test"
const nextValue = "test 2"

describe("Test useAtom", () => {
  it("Returns value with useAtom", () => {
    const testAtom = createAtom({ defaultValue })
    const { result } = renderHook(useAtom, { initialProps: testAtom })
    expect(result.current).toBe(defaultValue)
  })

  it("Updates value with useAtom", () => {
    const testAtom = createAtom({ defaultValue })
    const { result } = renderHook(useAtom, { initialProps: testAtom })
    expect(result.current).toBe(defaultValue)

    act(() => {
      testAtom.set(nextValue)
    })
    expect(result.current).toBe(nextValue)
    expect(testAtom.get()).toBe(nextValue)
  })
})

describe("Test useAtom with derived values", () => {
  it("Returns the derive value", () => {
    const testAtom = createAtom({ defaultValue: 1 })
    const testDerive = createDerived(({ get }) => get(testAtom) * 2)
    const { result } = renderHook(useAtom, { initialProps: testDerive })
    expect(result.current).toBe(2)
  })

  it("Updates the derive value", () => {
    const testAtom = createAtom({ defaultValue: 1 })
    const testDerive = createDerived(({ get }) => get(testAtom) * 2)
    const { result } = renderHook(useAtom, { initialProps: testDerive })

    act(() => {
      testAtom.set(2)
    })
    expect(result.current).toBe(4)
  })
})
