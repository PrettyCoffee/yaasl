import { describe, expect, it } from "vitest"

import { memoizeFunction } from "./memoize-function"

const initialState = {
  a: { b: { c: 1 } },
}

const selector = (state: typeof initialState, value: number) => ({
  value: state.a.b.c,
  match: state.a.b.c === value,
})

describe("Test memoizeFunction", () => {
  it("Memoizes results", () => {
    const select = memoizeFunction(selector)

    const first = select(initialState, 1)
    expect(first.value).toBe(1)

    const second = select({ a: { b: { c: 1 } } }, 1)
    expect(second).toBe(first) // doesn't change the object reference
    expect(second.value).toBe(1)
    expect(second.match).toBe(true)

    const third = select({ a: { b: { c: 2 } } }, 1)
    expect(third).not.toBe(first)
    expect(third.value).toBe(2)
    expect(third.match).toBe(false)

    const fourth = select({ a: { b: { c: 2 } } }, 2)
    expect(fourth).not.toBe(first)
    expect(fourth.value).toBe(2)
    expect(fourth.match).toBe(true)
  })

  it("Memoizes args", () => {
    let calls = 0
    const countingSelector: typeof selector = (...args) => {
      calls += 1
      return selector(...args)
    }
    const select = memoizeFunction(countingSelector)

    select(initialState, 1)
    expect(calls).toBe(1)

    select(initialState, 1)
    expect(calls).toBe(1)

    const next: typeof initialState = { a: { b: { c: 2 } } }

    select(next, 1)
    select(next, 1)
    expect(calls).toBe(2)

    select(next, 2)
    select(next, 2)
    expect(calls).toBe(3)
  })

  it("Uses updated resultFn function", () => {
    const initialState = { a: "value a", b: "value b" }

    let calls = 0
    const selectorA = (state: typeof initialState) => {
      calls += 1
      return state.a
    }
    const selectorB = (state: typeof initialState) => {
      calls += 1
      return state.b
    }

    const select = memoizeFunction(selectorA)

    expect(select(initialState)).toBe("value a")
    expect(calls).toBe(1)
    expect(select(initialState)).toBe("value a")
    expect(calls).toBe(1)

    select.resultFn = selectorB

    expect(select(initialState)).toBe("value b")
    expect(calls).toBe(2)
    expect(select(initialState)).toBe("value b")
    expect(calls).toBe(2)
  })

  it("Uses updated compareResult function", () => {
    const select = memoizeFunction((state: typeof initialState) => ({
      ...state.a.b,
    }))

    const results = [] as ReturnType<typeof select>[]

    results.unshift(select({ a: { b: { c: 1 } } }))
    results.unshift(select({ a: { b: { c: 1 } } }))
    expect(results[0]).toBe(results[1])

    select.compareResult = () => false

    results.unshift(select({ a: { b: { c: 1 } } }))
    expect(results[0]).not.toBe(results[1])
    results.unshift(select({ a: { b: { c: 2 } } }))
    expect(results[0]).not.toBe(results[1])

    select.compareResult = () => true

    results.unshift(select({ a: { b: { c: 1 } } }))
    expect(results[0]).toBe(results[1])
    results.unshift(select({ a: { b: { c: 2 } } }))
    expect(results[0]).toBe(results[1])

    // Goes back to deep equal if undefined
    select.compareResult = undefined

    results.unshift(select({ a: { b: { c: 2 } } }))
    expect(results[0]).toBe(results[1])
    results.unshift(select({ a: { b: { c: 2 } } }))
    expect(results[0]).toBe(results[1])
  })
})
