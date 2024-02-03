import { act, renderHook } from "@testing-library/react"
import { atom } from "@yaasl/core"

import { useAtomValue, useSetAtom, useAtom } from "./useAtom"

const defaultValue = "test"
const nextValue = "test 2"

describe("Test useAtom", () => {
  it("Returns value with useAtomValue", () => {
    const testAtom = atom({ defaultValue })
    const { result } = renderHook(useAtomValue, { initialProps: testAtom })
    expect(result.current).toBe(defaultValue)
  })

  it("Returns setter with useSetAtom", () => {
    const testAtom = atom({ defaultValue })
    const { result } = renderHook(useSetAtom, { initialProps: testAtom })
    act(() => {
      result.current(nextValue)
    })
    expect(testAtom.get()).toBe(nextValue)
  })

  it("Returns pair of value and setter with useAtom", () => {
    const testAtom = atom({ defaultValue })
    const { result } = renderHook(useAtom, { initialProps: testAtom })

    expect(result.current[0]).toBe(defaultValue)
    act(() => {
      result.current[1](nextValue)
    })
    expect(result.current[0]).toBe(nextValue)
    expect(testAtom.get()).toBe(nextValue)
  })

  it("Allows passing a function into the setter", () => {
    const numberAtom = atom({ defaultValue: 0 })
    const { result } = renderHook(useAtom, { initialProps: numberAtom })

    act(() => {
      result.current[1](prev => prev + 1)
    })
    expect(result.current[0]).toBe(1)
    expect(numberAtom.get()).toBe(1)
  })
})
