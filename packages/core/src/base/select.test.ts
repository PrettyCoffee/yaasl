import { atom } from "./atom"
import { select } from "./select"

const defaultValue = {
  value: "test",
  otherValue: "test",
  deep: {
    deeper: {
      value: "other test",
    },
  },
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe("Test select", () => {
  it("Selects a value", () => {
    const testAtom = atom({ defaultValue })
    const selected = select(testAtom, "value")
    expect(selected.get()).toBe(defaultValue.value)
  })

  it("Selects a deep value", () => {
    const testAtom = atom({ defaultValue })
    const selected = select(testAtom, "deep.deeper.value")
    expect(selected.get()).toBe(defaultValue.deep.deeper.value)
  })

  it("Subscribes to selected value", () => {
    const testAtom = atom({ defaultValue })
    const selected = select(testAtom, "value")

    const onChange = vi.fn()
    selected.subscribe(onChange)

    expect(onChange).not.toHaveBeenCalled()

    testAtom.set(prev => ({ ...prev, value: "next" }))
    expect(selected.get()).toBe("next")
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it("Only calls subscribers if selected value changes", () => {
    const testAtom = atom({ defaultValue })
    const selected = select(testAtom, "value")

    const onChange = vi.fn()
    selected.subscribe(onChange)
    expect(onChange).not.toHaveBeenCalled()

    testAtom.set(prev => ({ ...prev, otherValue: "next" }))
    expect(onChange).not.toHaveBeenCalled()
  })
})
