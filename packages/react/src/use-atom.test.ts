import { act, renderHook } from "@testing-library/react"
import { createAtom, createDerived } from "@yaasl/core"
import { it, describe, expect } from "vitest"

import { useAtomValue, useSetAtom, useAtom } from "./use-atom"

const defaultValue = "test"
const nextValue = "test 2"

describe("Test useAtom", () => {
  it("Returns value with useAtomValue", () => {
    const testAtom = createAtom({ defaultValue })
    const { result } = renderHook(useAtomValue, { initialProps: testAtom })
    expect(result.current).toBe(defaultValue)
  })

  it("Returns setter with useSetAtom", () => {
    const testAtom = createAtom({ defaultValue })
    const { result } = renderHook(useSetAtom, { initialProps: testAtom })
    act(() => {
      result.current(nextValue)
    })
    expect(testAtom.get()).toBe(nextValue)
  })

  it("Returns pair of value and setter with useAtom", () => {
    const testAtom = createAtom({ defaultValue })
    const { result } = renderHook(useAtom, { initialProps: testAtom })

    expect(result.current[0]).toBe(defaultValue)
    act(() => {
      result.current[1](nextValue)
    })
    expect(result.current[0]).toBe(nextValue)
    expect(testAtom.get()).toBe(nextValue)
  })

  it("Allows passing a function into the setter", () => {
    const numberAtom = createAtom({ defaultValue: 0 })
    const { result } = renderHook(useAtom, { initialProps: numberAtom })

    act(() => {
      result.current[1](prev => prev + 1)
    })
    expect(result.current[0]).toBe(1)
    expect(numberAtom.get()).toBe(1)
  })
})

describe("Test useAtom with derived values", () => {
  it("Returns the derive value", () => {
    const testAtom = createAtom({ defaultValue: 1 })
    const testDerive = createDerived(({ get }) => get(testAtom) * 2)
    const { result } = renderHook(useAtom, { initialProps: testDerive })
    expect(result.current[0]).toBe(2)
  })

  it("Throws an error if setter is used if derive is not settable", () => {
    const testAtom = createAtom({ defaultValue: 1 })
    const testDerive = createDerived(({ get }) => get(testAtom) * 2)
    const { result } = renderHook(useAtom, { initialProps: testDerive })
    expect(() => result.current[1](2)).toThrow()
  })

  it("Uses settable derive atoms", () => {
    const testAtom = createAtom({ defaultValue: 1 })
    const testDerive = createDerived(
      ({ get }) => get(testAtom) * 2,
      ({ value, set }) => set(testAtom, value / 2)
    )
    const { result } = renderHook(useAtom, { initialProps: testDerive })
    expect(result.current[0]).toBe(2)
    act(() => {
      result.current[1](4)
    })
    expect(testAtom.get()).toBe(2)
    expect(result.current[0]).toBe(4)
  })
})
