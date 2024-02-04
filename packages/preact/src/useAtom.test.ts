import { act, renderHook } from "@testing-library/preact"
import { atom } from "@yaasl/core"

import { useAtomValue, useSetAtom, useAtom } from "./useAtom"

const defaultValue = "test"
const nextValue = "test 2"

/** Currently @testing-library/preact seems to be broken in some cases.
 *  Therefore tests will be skipped for now.
 *  When fixing this, also remove the ".ignore --passWithNoTests" from the test script.
 *
 *  See https://github.com/testing-library/preact-testing-library/issues/70
 **/

describe.skip("Test useAtom", () => {
  it("Returns value with useAtomValue", () => {
    const testAtom = atom({ defaultValue })
    const { result } = renderHook(useAtomValue, { initialProps: testAtom })
    expect(result.current).toBe(defaultValue)
  })

  it("Returns setter with useSetAtom", async () => {
    const testAtom = atom({ defaultValue })
    const { result } = renderHook(useSetAtom, { initialProps: testAtom })
    await act(() => {
      result.current(nextValue)
    })
    expect(testAtom.get()).toBe(nextValue)
  })

  it("Returns pair of value and setter with useAtom", async () => {
    const testAtom = atom({ defaultValue })
    const { result } = renderHook(useAtom, { initialProps: testAtom })

    expect(result.current[0]).toBe(defaultValue)
    await act(() => {
      result.current[1](nextValue)
    })
    expect(result.current[0]).toBe(nextValue)
    expect(testAtom.get()).toBe(nextValue)
  })

  it("Allows passing a function into the setter", async () => {
    const numberAtom = atom({ defaultValue: 0 })
    const { result } = renderHook(useAtom, { initialProps: numberAtom })

    await act(() => {
      result.current[1](prev => prev + 1)
    })
    expect(result.current[0]).toBe(1)
    expect(numberAtom.get()).toBe(1)
  })
})
