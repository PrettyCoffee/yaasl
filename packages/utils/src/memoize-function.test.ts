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
})
