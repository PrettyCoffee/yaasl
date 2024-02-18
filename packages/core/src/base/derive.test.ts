import { atom } from "./atom"
import { derive } from "./derive"

const defaultValue = "default"
const nextValue = "next"

beforeEach(() => vi.resetAllMocks())

describe("Test atom", () => {
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
})
