import { sleep } from "@yaasl/utils"

import { createAtom } from "./createAtom"
import { createSelector } from "./createSelector"
import { createEffect } from "../effects"

const defaultValue = {
  value: "test",
  otherValue: "test",
  deep: {
    deeper: {
      value: "other test",
    },
  },
}

const initSleep = createEffect<{ duration?: number } | undefined>(
  ({ options }) => {
    const duration = options?.duration ?? 0
    return {
      init: () => sleep(duration),
      didInit: () => sleep(duration),
    }
  }
)

beforeEach(() => {
  vi.resetAllMocks()
})

describe("Test createSelector", () => {
  describe("Path selector", () => {
    it("Selects a value", () => {
      const testAtom = createAtom({ defaultValue })
      const selected = createSelector(testAtom, "value")
      expect(selected.get()).toBe(defaultValue.value)
    })

    it("Selects a deep value", () => {
      const testAtom = createAtom({ defaultValue })
      const selected = createSelector(testAtom, "deep.deeper.value")
      expect(selected.get()).toBe(defaultValue.deep.deeper.value)
    })

    it("Subscribes to selected value", () => {
      const testAtom = createAtom({ defaultValue })
      const selected = createSelector(testAtom, "value")

      const onChange = vi.fn()
      selected.subscribe(onChange)

      expect(onChange).not.toHaveBeenCalled()

      testAtom.set(prev => ({ ...prev, value: "next" }))
      expect(selected.get()).toBe("next")
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it("Only calls subscribers if selected value changes", () => {
      const testAtom = createAtom({ defaultValue })
      const selected = createSelector(testAtom, "value")

      const onChange = vi.fn()
      selected.subscribe(onChange)
      expect(onChange).not.toHaveBeenCalled()

      testAtom.set(prev => ({ ...prev, otherValue: "next" }))
      expect(onChange).not.toHaveBeenCalled()
    })

    describe("synchronizes didInit status", () => {
      it("Sets true if no effects were passed", () => {
        const testAtom = createAtom({ defaultValue })
        const selected = createSelector(testAtom, "value")
        expect(selected.didInit).toBe(true)
      })

      it("Updates if effects are asynchronous", async () => {
        const testAtom = createAtom({ defaultValue, effects: [initSleep()] })
        const selected = createSelector(testAtom, "value")

        expect(selected.didInit).toBeInstanceOf(Promise)
        await selected.didInit
        expect(selected.didInit).toBe(true)
      })
    })
  })

  describe("Combiner selector", () => {
    it("Uses a state from one atom", () => {
      const testAtom = createAtom({ defaultValue: 1 })
      const selected = createSelector([testAtom], state => String(state))
      expect(selected.get()).toBe("1")
    })

    it("Uses a state from multiple atoms", () => {
      const atom1 = createAtom({ defaultValue: 1 })
      const atom2 = createAtom({ defaultValue: 2 })
      const selected = createSelector(
        [atom1, atom2],
        (state1, state2) => state1 + state2
      )
      expect(selected.get()).toBe(3)
    })

    it("Updates the state if an atom changes", () => {
      const atom1 = createAtom({ defaultValue: 1 })
      const atom2 = createAtom({ defaultValue: 2 })
      const selected = createSelector(
        [atom1, atom2],
        (state1, state2) => state1 + state2
      )

      atom1.set(2)
      expect(selected.get()).toBe(4)
    })

    it("Subscribes to selected value", () => {
      const testAtom = createAtom({ defaultValue: 1 })
      const selected = createSelector([testAtom], state => String(state))

      const onChange = vi.fn()
      selected.subscribe(onChange)

      expect(onChange).not.toHaveBeenCalled()

      testAtom.set(2)
      expect(selected.get()).toBe("2")
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it("Only calls subscribers if selected state changes", () => {
      const testAtom = createAtom({ defaultValue })
      const selected = createSelector([testAtom], state => state.value)

      const onChange = vi.fn()
      selected.subscribe(onChange)
      expect(onChange).not.toHaveBeenCalled()

      testAtom.set(prev => ({ ...prev, otherValue: "next" }))
      expect(onChange).not.toHaveBeenCalled()
    })

    describe("synchronizes didInit status", () => {
      it("Sets true if no effects were passed", () => {
        const atom1 = createAtom({ defaultValue: 1 })
        const atom2 = createAtom({ defaultValue: 2 })
        const selected = createSelector(
          [atom1, atom2],
          (state1, state2) => state1 + state2
        )
        expect(selected.didInit).toBe(true)
      })

      it("Updates if effects are asynchronous", async () => {
        const atom1 = createAtom({ defaultValue: 1 })
        const atom2 = createAtom({ defaultValue: 2, effects: [initSleep()] })
        const selected = createSelector(
          [atom1, atom2],
          (state1, state2) => state1 + state2
        )

        expect(selected.didInit).toBeInstanceOf(Promise)
        await selected.didInit
        expect(selected.didInit).toBe(true)
      })

      it("Updates if multiple effects are asynchronous", async () => {
        const atom1 = createAtom({ defaultValue: 1, effects: [initSleep()] })
        const atom2 = createAtom({
          defaultValue: 2,
          effects: [initSleep({ duration: 10 })],
        })
        const selected = createSelector(
          [atom1, atom2],
          (state1, state2) => state1 + state2
        )

        expect(selected.didInit).toBeInstanceOf(Promise)

        await atom1.didInit
        expect(atom1.didInit).toBe(true)
        expect(atom2.didInit).toBeInstanceOf(Promise)
        expect(selected.didInit).toBeInstanceOf(Promise)

        await atom2.didInit
        await sleep(5) // Will need a short amount of time to set the state
        expect(selected.didInit).toBe(true)
      })
    })
  })
})
