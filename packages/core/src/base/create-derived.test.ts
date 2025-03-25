import { sleep } from "@yaasl/utils"
import { vi, it, describe, expect, beforeEach } from "vitest"

import { createAtom } from "./create-atom"
import { createDerived } from "./create-derived"
import { createEffect } from "../effects"

const defaultValue = "default"
const nextValue = "next"

beforeEach(() => {
  vi.resetAllMocks()
})

describe("Test derive", () => {
  it("Derives a value", () => {
    const atom1 = createAtom({ defaultValue })
    const atom2 = createAtom({ defaultValue })

    const testDerive = createDerived(({ get }) => {
      const val1 = get(atom1)
      const val2 = get(atom2)
      return val1 + val2
    })
    expect(testDerive.get()).toBe(defaultValue + defaultValue)
  })

  it("Derives an inner value", () => {
    const defaultValue = {
      current: {
        value: "test",
      },
    }
    const testAtom = createAtom({ defaultValue })
    const testDerive = createDerived(({ get }) => get(testAtom).current.value)
    expect(testDerive.get()).toBe(defaultValue.current.value)
  })

  it("Updates on change", () => {
    const atom1 = createAtom({ defaultValue })
    const atom2 = createAtom({ defaultValue })

    const testDerive = createDerived(({ get }) => {
      const val1 = get(atom1)
      const val2 = get(atom2)
      return val1 + val2
    })

    atom1.set(nextValue)
    expect(testDerive.get()).toBe(nextValue + defaultValue)

    atom2.set(nextValue)
    expect(testDerive.get()).toBe(nextValue + nextValue)
  })

  it("Only updates if actually changing the result", () => {
    const a = { value: "test-a" }
    const b = { value: "test-b" }
    const next = { value: "next" }
    const testAtom = createAtom({ defaultValue: { a, b, deeper: { a, b } } })
    const testDerive = createDerived(({ get }) => get(testAtom).deeper.a)

    const change = vi.fn()
    testDerive.subscribe(change)

    testAtom.set(prev => ({ ...prev, b: next }))
    testAtom.set(prev => ({ ...prev, deeper: { ...prev.deeper, b: next } }))
    expect(change).not.toHaveBeenCalled()

    testAtom.set(prev => ({ ...prev, deeper: { ...prev.deeper, a: next } }))
    expect(change).toHaveBeenCalledWith(next, a)
  })

  it("Can be destroyed", () => {
    const action = vi.fn()
    const atom = createAtom({
      defaultValue: 2,
    })
    const derived = createDerived(
      ({ get }) => get(atom) * 2,
      ({ set }) => set(atom, value => value / 2)
    )

    derived.destroy()
    expect(derived.isDestroyed).toBeTruthy()

    expect(() => derived.get()).toThrow()
    expect(() => derived.set(2)).toThrow()
    expect(() => derived.subscribe(action)).toThrow()
  })

  it("Will be destroyed if parent is destroyed", () => {
    const action = vi.fn()
    const atom = createAtom({
      defaultValue: 2,
    })
    const derived = createDerived(({ get }) => get(atom) * 2)
    const derived2 = createDerived(({ get }) => get(derived) * 2)

    atom.destroy()

    expect(derived.isDestroyed).toBeTruthy()
    expect(derived2.isDestroyed).toBeTruthy()
    expect(() => derived2.get()).toThrow()
    expect(() => derived2.subscribe(action)).toThrow()
  })

  describe("SettableDerive", () => {
    it("Elevates a new value", () => {
      const defaultValue = 1
      const atom1 = createAtom({ defaultValue })

      const testDerive = createDerived(
        ({ get }) => get(atom1) * 2,
        ({ value, set }) => set(atom1, value / 2)
      )

      testDerive.set(4)
      expect(atom1.get()).toBe(2)
    })

    it("Elevates multiple dependencies", () => {
      const defaultValue = 1
      const atom1 = createAtom({ defaultValue })
      const atom2 = createAtom({ defaultValue })

      const testDerive = createDerived(
        ({ get }) => ({
          value1: get(atom1),
          value2: get(atom2),
        }),
        ({ value, set }) => {
          set(atom1, value.value1)
          set(atom2, value.value2)
        }
      )

      expect(testDerive.get()).toEqual({ value1: 1, value2: 1 })

      atom1.set(4)
      expect(testDerive.get()).toEqual({ value1: 4, value2: 1 })

      testDerive.set({ value1: 2, value2: 2 })
      expect(atom1.get()).toBe(2)
      expect(atom2.get()).toBe(2)
    })

    it("Can use the previous value", () => {
      const defaultValue = { foo: "bar", value: 1 }
      const atom1 = createAtom({ defaultValue })

      const testDerive = createDerived(
        ({ get }) => get(atom1).value,
        ({ value, set }) => set(atom1, prev => ({ ...prev, value }))
      )

      testDerive.set(prev => prev + 1)
      expect(atom1.get()).toStrictEqual({ foo: "bar", value: 2 })
      expect(testDerive.get()).toBe(2)
    })

    it("Throws an error if set and get dependencies do not match", () => {
      const atom1 = createAtom({ defaultValue })
      const atom2 = createAtom({ defaultValue })

      expect(() =>
        createDerived(
          ({ get }) => get(atom1),
          ({ value, set }) => set(atom2, value)
        )
      ).toThrow()
    })
  })

  describe("synchronizes didInit status", () => {
    it("Sets true if no effects were passed", () => {
      const testAtom = createAtom({ defaultValue: 1 })
      const testDerive = createDerived(({ get }) => get(testAtom) * 2)
      expect(testDerive.didInit).toBe(true)
    })

    it("Updates if effects are asynchronous", async () => {
      const e = createEffect({
        init: () => sleep(1),
        didInit: () => sleep(1),
      })
      const testAtom = createAtom({ defaultValue: 1, effects: [e()] })
      const testDerive = createDerived(({ get }) => get(testAtom) * 2)

      expect(testDerive.didInit).toBeInstanceOf(Promise)
      await testDerive.didInit
      expect(testDerive.didInit).toBe(true)
    })
  })
})
