import { atom } from "./atom"
import { derive } from "./derive"
import { middleware } from "../middleware"
import { sleep } from "../utils/sleep"

const defaultValue = "default"
const nextValue = "next"

beforeEach(() => {
  vi.resetAllMocks()
})

describe("Test derive", () => {
  it("Derives a value", () => {
    const atom1 = atom({ defaultValue })
    const atom2 = atom({ defaultValue })

    const testDerive = derive(({ get }) => {
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
    const testAtom = atom({ defaultValue })
    const testDerive = derive(({ get }) => get(testAtom).current.value)
    expect(testDerive.get()).toBe(defaultValue.current.value)
  })

  it("Updates on change", () => {
    const atom1 = atom({ defaultValue })
    const atom2 = atom({ defaultValue })

    const testDerive = derive(({ get }) => {
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
    const testAtom = atom({ defaultValue: { a, b, deeper: { a, b } } })
    const testDerive = derive(({ get }) => get(testAtom).deeper.a)

    const change = vi.fn()
    testDerive.subscribe(change)

    testAtom.set(prev => ({ ...prev, b: next }))
    testAtom.set(prev => ({ ...prev, deeper: { ...prev.deeper, b: next } }))
    expect(change).not.toHaveBeenCalled()

    testAtom.set(prev => ({ ...prev, deeper: { ...prev.deeper, a: next } }))
    expect(change).toHaveBeenCalledWith(next, a)
  })

  describe("SettableDerive", () => {
    it("Elevates a new value", () => {
      const defaultValue = 1
      const atom1 = atom({ defaultValue })

      const testDerive = derive(
        ({ get }) => get(atom1) * 2,
        ({ value, set }) => set(atom1, value / 2)
      )

      testDerive.set(4)
      expect(atom1.get()).toBe(2)
    })

    it("Elevates multiple dependencies", () => {
      const defaultValue = 1
      const atom1 = atom({ defaultValue })
      const atom2 = atom({ defaultValue })

      const testDerive = derive(
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
      const atom1 = atom({ defaultValue })

      const testDerive = derive(
        ({ get }) => get(atom1).value,
        ({ value, set }) => set(atom1, prev => ({ ...prev, value }))
      )

      testDerive.set(prev => prev + 1)
      expect(atom1.get()).toStrictEqual({ foo: "bar", value: 2 })
      expect(testDerive.get()).toBe(2)
    })

    it("Throws an error if set and get dependencies do not match", () => {
      const atom1 = atom({ defaultValue })
      const atom2 = atom({ defaultValue })

      expect(() =>
        derive(
          ({ get }) => get(atom1),
          ({ value, set }) => set(atom2, value)
        )
      ).toThrow()
    })
  })

  describe("synchronizes didInit status", () => {
    it("Sets true if no midleware was passed", () => {
      const testAtom = atom({ defaultValue: 1 })
      const testDerive = derive(({ get }) => get(testAtom) * 2)
      expect(testDerive.didInit).toBe(true)
    })

    it("Updates if middleware is async", async () => {
      const m = middleware({
        init: () => sleep(1),
        didInit: () => sleep(1),
      })
      const testAtom = atom({ defaultValue: 1, middleware: [m()] })
      const testDerive = derive(({ get }) => get(testAtom) * 2)

      expect(testDerive.didInit).toBeInstanceOf(Promise)
      await testDerive.didInit
      expect(testDerive.didInit).toBe(true)
    })
  })
})
