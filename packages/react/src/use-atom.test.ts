import { act, renderHook } from "@testing-library/react"
import { createAtom, createDerived } from "@yaasl/core"
import { it, describe, expect } from "vitest"

import { useAtomValue } from "./use-atom"

const defaultValue = "test"
const nextValue = "test 2"

describe("Test useAtomValue", () => {
  it("Returns value with useAtomValue", () => {
    const testAtom = createAtom({ defaultValue })
    const { result } = renderHook(useAtomValue, { initialProps: testAtom })
    expect(result.current).toBe(defaultValue)
  })

  it("Updates value with useAtomValue", () => {
    const testAtom = createAtom({ defaultValue })
    const { result } = renderHook(useAtomValue, { initialProps: testAtom })
    expect(result.current).toBe(defaultValue)

    act(() => {
      testAtom.set(nextValue)
    })
    expect(result.current).toBe(nextValue)
    expect(testAtom.get()).toBe(nextValue)
  })
})

describe("Test useAtomValue with derived values", () => {
  it("Returns the derive value", () => {
    const testAtom = createAtom({ defaultValue: 1 })
    const testDerive = createDerived(({ get }) => get(testAtom) * 2)
    const { result } = renderHook(useAtomValue, { initialProps: testDerive })
    expect(result.current).toBe(2)
  })

  it("Updates the derive value", () => {
    const testAtom = createAtom({ defaultValue: 1 })
    const testDerive = createDerived(({ get }) => get(testAtom) * 2)
    const { result } = renderHook(useAtomValue, { initialProps: testDerive })

    act(() => {
      testAtom.set(2)
    })
    expect(result.current).toBe(4)
  })
})
