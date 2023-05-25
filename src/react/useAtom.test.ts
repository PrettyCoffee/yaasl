import { act, renderHook } from "@testing-library/react"

import { useAtomValue, useSetAtom, useAtom } from "./useAtom"
import { createAtom } from "../core"
import { createMiddleware } from "../middleware"

const value = "test"
const nextValue = "test 2"

describe("Test useAtom", () => {
  it("Returns value with useAtomValue", () => {
    const atom = createAtom(value)
    const { result } = renderHook(useAtomValue, { initialProps: atom })
    expect(result.current).toBe(value)
  })

  it("Returns setter with useSetAtom", () => {
    const atom = createAtom(value)
    const { result } = renderHook(useSetAtom, { initialProps: atom })
    act(() => {
      result.current(nextValue)
    })
    expect(atom.get()).toBe(nextValue)
  })

  it("Returns pair of value and setter with useAtom", () => {
    const atom = createAtom(value)
    const { result } = renderHook(useAtom, { initialProps: atom })

    expect(result.current[0]).toBe(value)
    act(() => {
      result.current[1](nextValue)
    })
    expect(result.current[0]).toBe(nextValue)
  })

  describe("Test with middleware", () => {
    const getMiddleware = () => {
      const onSet = jest.fn()
      const onGet = jest.fn()

      return {
        onGet,
        onSet,
        middleware: createMiddleware({
          onGet: value => {
            onGet(value)
          },
          onSet: value => {
            onSet(value)
          },
        }),
      }
    }

    it("Works with middleware atoms", () => {
      const { onGet, onSet, middleware } = getMiddleware()
      const atom = middleware(createAtom(value))
      const { result } = renderHook(useAtom, { initialProps: atom })

      expect(result.current[0]).toBe(value)
      expect(onGet).toHaveBeenCalledTimes(1)

      act(() => {
        result.current[1]("42")
      })
      expect(onGet).toHaveBeenCalledTimes(2)
      expect(onGet).toHaveBeenCalledWith("42")
      expect(result.current[0]).toBe("42")
      expect(onSet).toHaveBeenCalledTimes(1)
      expect(onSet).toHaveBeenCalledWith("42")
    })
  })
})
