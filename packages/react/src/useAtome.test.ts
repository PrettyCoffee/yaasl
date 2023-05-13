import { act, renderHook } from "@testing-library/react"
import { createAtom } from "@yaasl/vanilla"

import { useAtomValue, useSetAtom } from "./useAtom"
import { useAtom } from "../dist"

const value = "test"
const nextValue = "test 2"

describe("Test useAtom", () => {
  it("Test useAtomValue", () => {
    const atom = createAtom(value)
    const { result } = renderHook(useAtomValue, { initialProps: atom })
    expect(result.current).toBe(value)
  })

  it("Test useSetAtom", () => {
    const atom = createAtom(value)
    const { result } = renderHook(useSetAtom, { initialProps: atom })
    act(() => {
      result.current(nextValue)
    })
    expect(atom.get()).toBe(nextValue)
  })

  it("Test useAtom", () => {
    const atom = createAtom(value)
    const { result } = renderHook(useAtom, { initialProps: atom })

    expect(result.current[0]).toBe(value)
    act(() => {
      result.current[1](nextValue)
    })
    expect(result.current[0]).toBe(nextValue)
  })
})
