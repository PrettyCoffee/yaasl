import { atom } from "./atom"
import { derive } from "./derive"

const defaultValue = "default"
const nextValue = "next"

beforeEach(() => jest.resetAllMocks())

describe("Test atom", () => {
  it("Derives a value", () => {
    const atom1 = atom({ defaultValue })
    const atom2 = atom({ defaultValue })

    const testDerive = derive(({ get }) => {
      const val1 = get(atom1)
      const val2 = get(atom2)
      return val1 + val2
    })
    expect(testDerive.snapshot()).toBe(defaultValue + defaultValue)
  })

  it("Derives an inner value", () => {
    const defaultValue = {
      current: {
        value: "test",
      },
    }
    const testAtom = atom({ defaultValue })
    const testDerive = derive(({ get }) => get(testAtom).current.value)
    expect(testDerive.snapshot()).toBe(defaultValue.current.value)
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
    expect(testDerive.snapshot()).toBe(nextValue + defaultValue)

    atom2.set(nextValue)
    expect(testDerive.snapshot()).toBe(nextValue + nextValue)
  })
})
