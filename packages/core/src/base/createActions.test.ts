import { atom } from "./atom"
import { createActions } from "./createActions"

describe("Test createActions", () => {
  it("Creates actions", () => {
    const testAtom = atom({ defaultValue: 0 })
    const actions = createActions(testAtom, {
      increment: state => state + 1,
      decrement: state => state - 1,
      set: (_, payload: number) => payload,
    })

    expect(testAtom.get()).toBe(0)
    expect(actions).toHaveProperty("increment")
    expect(actions).toHaveProperty("decrement")
    expect(actions).toHaveProperty("set")
  })

  it("Allows using the existing state in actions", () => {
    const testAtom = atom({ defaultValue: 0 })
    const actions = createActions(testAtom, {
      increment: state => state + 1,
      decrement: state => state - 1,
      set: (_, payload: number) => payload,
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
    const testAtom = atom({ defaultValue: 0 })
    const actions = createActions(testAtom, {
      increment: state => state + 1,
      decrement: state => state - 1,
      set: (_, payload: number) => payload,
    })

    expect(testAtom.get()).toBe(0)
    actions.set(123)
    expect(testAtom.get()).toBe(123)
    actions.set(456)
    expect(testAtom.get()).toBe(456)
  })
})
