import { sleep } from "@yaasl/utils"

import { atom } from "./atom"
import { select } from "./select"
import { effect } from "../effects"

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

  describe("synchronizes didInit status", () => {
    it("Sets true if no effects were passed", () => {
      const testAtom = atom({ defaultValue })
      const selected = select(testAtom, "value")
      expect(selected.didInit).toBe(true)
    })

    it("Updates if effects are asynchronous", async () => {
      const e = effect({
        init: () => sleep(1),
        didInit: () => sleep(1),
      })
      const testAtom = atom({ defaultValue, effects: [e()] })
      const selected = select(testAtom, "value")

      expect(selected.didInit).toBeInstanceOf(Promise)
      await selected.didInit
      expect(selected.didInit).toBe(true)
    })
  })
})
