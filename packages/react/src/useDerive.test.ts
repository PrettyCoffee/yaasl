import { act, renderHook } from "@testing-library/react"
import { atom, derive } from "@yaasl/core"

import { useDerive } from "./useDerive"

describe("Test useDerive", () => {
  it("Returns the derive value", () => {
    const testAtom = atom({ defaultValue: 1 })
    const testDerive = derive(({ get }) => get(testAtom) * 2)
    const { result } = renderHook(useDerive, { initialProps: testDerive })
    expect(result.current[0]).toBe(2)
  })

  it("Throws an error if setter is used if derive is not settable", () => {
    const testAtom = atom({ defaultValue: 1 })
    const testDerive = derive(({ get }) => get(testAtom) * 2)
    const { result } = renderHook(useDerive, { initialProps: testDerive })
    expect(() => result.current[1](2)).toThrow()
  })

  it("Uses settable derive atoms", () => {
    const testAtom = atom({ defaultValue: 1 })
    const testDerive = derive(
      ({ get }) => get(testAtom) * 2,
      ({ value, set }) => set(testAtom, value / 2)
    )
    const { result } = renderHook(useDerive, { initialProps: testDerive })
    expect(result.current[0]).toBe(2)
    act(() => {
      result.current[1](4)
    })
    expect(testAtom.get()).toBe(2)
    expect(result.current[0]).toBe(4)
  })
})
