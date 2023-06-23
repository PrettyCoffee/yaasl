import { act, renderHook } from "@testing-library/react"

import { useAtomValue, useSetAtom, useAtom } from "./useAtom"
import { atom, globalStore } from "../new-core"
import { middleware } from "../new-middleware"

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
    expect(globalStore.get(testAtom)).toBe(nextValue)
  })

  it("Returns pair of value and setter with useAtom", () => {
    const testAtom = atom({ defaultValue })
    const { result } = renderHook(useAtom, { initialProps: testAtom })

    expect(result.current[0]).toBe(defaultValue)
    act(() => {
      result.current[1](nextValue)
    })
    expect(result.current[0]).toBe(nextValue)
  })

  describe("Test with middleware", () => {
    const getMiddleware = () => {
      const onInit = jest.fn()
      const onSet = jest.fn()

      return {
        onSet,
        onInit,
        testMiddleware: middleware(({ type, value }) => {
          if (type === "SET") onSet(value)
          else if (type === "INIT") onInit(value)
        }),
      }
    }

    it("Works with middleware atoms", () => {
      const { onSet, onInit, testMiddleware } = getMiddleware()
      const testAtom = atom({ defaultValue, middleware: [testMiddleware()] })

      const { result } = renderHook(useAtom, {
        initialProps: testAtom,
      })

      expect(onInit).toHaveBeenCalledTimes(1)
      expect(onInit).toHaveBeenCalledWith(defaultValue)

      expect(result.current[0]).toBe(defaultValue)

      act(() => {
        result.current[1]("42")
      })
      expect(result.current[0]).toBe("42")
      expect(onSet).toHaveBeenCalledTimes(1)
      expect(onSet).toHaveBeenCalledWith("42")
    })
  })
})