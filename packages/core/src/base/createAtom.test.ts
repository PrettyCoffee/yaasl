import { sleep } from "@yaasl/utils"

import { createAtom } from "./createAtom"
import { createEffect } from "../effects"

const defaultValue = "default"
const nextValue = "next"

beforeEach(() => {
  vi.resetAllMocks()
})

describe("Test atom", () => {
  it("Creates an atom with default value", () => {
    expect(createAtom({ defaultValue })).toHaveProperty(
      "defaultValue",
      defaultValue
    )
  })

  it("Creates an atom with unique name", () => {
    expect(createAtom({ defaultValue }).name).toMatch(/atom-\d+/)
  })

  it("Creates an atom with custom name", () => {
    const name = "test"
    expect(createAtom({ defaultValue, name })).toHaveProperty("name", name)
  })

  it("Returns the defaultValue initially", () => {
    expect(createAtom({ defaultValue }).get()).toBe(defaultValue)
  })

  it("Sets the value", () => {
    const testAtom = createAtom({ defaultValue })
    testAtom.set(nextValue)
    expect(testAtom.get()).toBe(nextValue)
  })

  it("Subscribes to changes", () => {
    const action = vi.fn()
    const testAtom = createAtom({ defaultValue })

    testAtom.subscribe(action)
    expect(action).not.toHaveBeenCalled()
    testAtom.set(nextValue)

    expect(action).toHaveBeenCalledTimes(1)
    expect(action).toHaveBeenCalledWith(nextValue, defaultValue)
  })

  it("Unsubscribes from changes", () => {
    const action = vi.fn()
    const testAtom = createAtom({ defaultValue })

    const unsub = testAtom.subscribe(action)
    unsub()
    testAtom.set(nextValue)

    expect(action).not.toHaveBeenCalled()
  })

  it("Adds actions to the atom", () => {
    const testAtom = createAtom({
      defaultValue: 0,
      reducers: {
        increment: state => state + 1,
        decrement: state => state - 1,
        add: (state, payload: number) => state + payload,
      },
    })

    expect(testAtom.get()).toBe(0)
    testAtom.actions.increment()
    expect(testAtom.get()).toBe(1)
    testAtom.actions.add(122)
    expect(testAtom.get()).toBe(123)
    testAtom.actions.add(123)
    expect(testAtom.get()).toBe(246)
  })

  describe("synchronizes didInit status", () => {
    it("Sets true if no effect was passed", () => {
      const testAtom = createAtom({ defaultValue })
      expect(testAtom.didInit).toBe(true)
    })

    it("Sets true if effects are synchronous", () => {
      const init = vi.fn()
      const didInit = vi.fn()

      const e = createEffect({ init, didInit })
      const testAtom = createAtom({ defaultValue, effects: [e()] })
      expect(testAtom.didInit).toBe(true)
    })

    it("Updates if effects are asynchronous", async () => {
      const e = createEffect({
        init: () => sleep(1),
        didInit: () => sleep(1),
      })
      const testAtom = createAtom({ defaultValue, effects: [e()] })

      expect(testAtom.didInit).toBeInstanceOf(Promise)
      await testAtom.didInit
      expect(testAtom.didInit).toBe(true)
    })
  })
})
