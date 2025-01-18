import { it, describe, expect } from "vitest"

import { createActions } from "./createActions"
import { createAtom } from "./createAtom"

describe("Test createActions", () => {
  it("Creates actions", () => {
    const testAtom = createAtom({ defaultValue: 0 })
    const actions = createActions(testAtom, {
      increment: state => state + 1,
      decrement: state => state - 1,
    })

    expect(testAtom.get()).toBe(0)
    expect(actions).toHaveProperty("increment")
    expect(actions).toHaveProperty("decrement")
  })

  it("Allows using the existing state in actions", () => {
    const testAtom = createAtom({ defaultValue: 0 })
    const actions = createActions(testAtom, {
      increment: state => state + 1,
      decrement: state => state - 1,
    })

    expect(testAtom.get()).toBe(0)
    actions.increment()
    expect(testAtom.get()).toBe(1)
    actions.increment()
    expect(testAtom.get()).toBe(2)
    actions.decrement()
    expect(testAtom.get()).toBe(1)
  })

  it("Allows passing a payload to actions", () => {
    const testAtom = createAtom({ defaultValue: 0 })
    const actions = createActions(testAtom, {
      increment: state => state + 1,
      decrement: state => state - 1,
      add: (state, payload: number) => state + payload,
    })

    expect(testAtom.get()).toBe(0)
    actions.add(123)
    expect(testAtom.get()).toBe(123)
    actions.add(123)
    expect(testAtom.get()).toBe(246)
  })

  it("Allows passing multiple payload args to actions", () => {
    const testAtom = createAtom({ defaultValue: 0 })
    const actions = createActions(testAtom, {
      add: (state, ...values: number[]) =>
        values.reduce((a, b) => a + b, state),
    })

    expect(testAtom.get()).toBe(0)
    actions.add(2)
    expect(testAtom.get()).toBe(2)
    actions.add(2, 2, 2)
    expect(testAtom.get()).toBe(8)
  })
})
