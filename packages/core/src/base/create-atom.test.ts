import { sleep } from "@yaasl/utils"
import { vi, it, describe, expect, beforeEach } from "vitest"

import { CONFIG } from "./config"
import { createAtom } from "./create-atom"
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

  it("Uses global effects", () => {
    const global = { init: vi.fn(), set: vi.fn() }
    const local = { init: vi.fn(), set: vi.fn() }
    CONFIG.globalEffects = [createEffect(global)()]

    expect(global.init).not.toHaveBeenCalled()
    expect(local.init).not.toHaveBeenCalled()
    const testAtom = createAtom({
      defaultValue,
      effects: [createEffect(local)()],
    })
    expect(global.init).toHaveBeenCalledTimes(1)
    expect(local.init).toHaveBeenCalledTimes(1)

    expect(global.set).not.toHaveBeenCalled()
    expect(local.set).not.toHaveBeenCalled()
    testAtom.set(nextValue)
    expect(global.set).toHaveBeenCalledTimes(1)
    expect(local.set).toHaveBeenCalledTimes(1)
  })

  it("Only triggers effects and subscribers if value changes", () => {
    const action = vi.fn()
    const effect = { init: vi.fn(), set: vi.fn() }
    const testAtom = createAtom({
      defaultValue,
      effects: [createEffect(effect)()],
    })
    testAtom.subscribe(action)

    testAtom.set(defaultValue)

    expect(effect.set).not.toHaveBeenCalled()
    expect(action).not.toHaveBeenCalled()

    testAtom.set(nextValue)
    expect(effect.set).toHaveBeenCalled()
    expect(action).toHaveBeenCalled()
  })

  it("Can be destroyed", () => {
    const action = vi.fn()
    const testAtom = createAtom({
      defaultValue,
    })
    testAtom.subscribe(action)

    testAtom.destroy()

    expect(testAtom.isDestroyed).toBeTruthy()
    expect(() => testAtom.set(nextValue)).toThrow()
    expect(() => testAtom.get()).toThrow()
    expect(() => testAtom.subscribe(action)).toThrow()
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
