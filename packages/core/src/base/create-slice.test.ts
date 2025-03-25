import { it, describe, expect } from "vitest"

import { Atom } from "./create-atom"
import { createSlice } from "./create-slice"
import { Stateful } from "./stateful"

const increment = (state: number) => state + 1

const double = (state: number) => state * 2

const isNotEmpty = (obj?: object) => obj && Object.keys(obj).length > 0

describe("Test createSlice", () => {
  it.each`
    case                 | reducers         | selectors
    ${"No props"}        | ${undefined}     | ${undefined}
    ${"empty reducers"}  | ${{}}            | ${undefined}
    ${"empty selectors"} | ${undefined}     | ${{}}
    ${"an reducer"}      | ${{ increment }} | ${undefined}
    ${"a selector"}      | ${undefined}     | ${{ double }}
    ${"both props"}      | ${{ increment }} | ${{ double }}
  `("Has correct attributes with > $case", ({ reducers, selectors }) => {
    const slice = createSlice({ defaultValue: 0, reducers, selectors })

    expect(slice).toHaveProperty("defaultValue", 0)

    if (isNotEmpty(reducers)) {
      expect(slice).toHaveProperty("actions")
    } else {
      expect(slice).not.toHaveProperty("actions")
    }

    if (isNotEmpty(selectors)) {
      expect(slice).toHaveProperty("selectors")
    } else {
      expect(slice).not.toHaveProperty("selectors")
    }
  })

  it("Creates a slice with default value", () => {
    const slice = createSlice({ defaultValue: 0 })
    expect(slice).toHaveProperty("defaultValue", 0)
    expect(slice).not.toHaveProperty("actions")
    expect(slice).not.toHaveProperty("selectors")
  })

  it("Is an atom instance", () => {
    const slice = createSlice({
      defaultValue: 0,
      reducers: { increment },
      selectors: { double },
    })
    expect(slice).toBeInstanceOf(Atom)
    expect(slice).toBeInstanceOf(Stateful)
  })

  it("Creates a slice with reducers", () => {
    const slice = createSlice({
      defaultValue: 0,
      reducers: {
        increment: state => state + 1,
        add: (state, ...values: number[]) =>
          values.reduce((a, b) => a + b, state),
      },
    })

    expect(slice).toHaveProperty("actions")
    expect(slice).not.toHaveProperty("selectors")

    expect(slice.get()).toBe(0)
    slice.actions.increment()
    expect(slice.get()).toBe(1)
    slice.actions.add(1, 2, 3, 4, 5)
    expect(slice.get()).toBe(16)
  })

  it("Creates a slice with path selectors", () => {
    const slice = createSlice({
      defaultValue: { count: 0, deeper: { value: 0 } },
      selectors: {
        count: "count",
        deeper: "deeper.value",
      },
    })

    expect(slice).not.toHaveProperty("actions")
    expect(slice).toHaveProperty("selectors")

    expect(slice.selectors.count.get()).toBe(0)
    expect(slice.selectors.deeper.get()).toBe(0)

    slice.set({ count: 1, deeper: { value: 2 } })
    expect(slice.selectors.count.get()).toBe(1)
    expect(slice.selectors.deeper.get()).toBe(2)
  })

  it("Creates a slice with combiner selectors", () => {
    const slice = createSlice({
      defaultValue: 0,
      selectors: {
        double: state => state * 2,
        triple: state => state * 3,
      },
    })

    expect(slice.selectors.double.get()).toBe(0)
    expect(slice.selectors.triple.get()).toBe(0)

    slice.set(1)
    expect(slice.selectors.double.get()).toBe(2)
    expect(slice.selectors.triple.get()).toBe(3)
  })

  it("Creates a slice with reducers and selectors", () => {
    const slice = createSlice({
      defaultValue: 0,
      reducers: {
        increment: state => state + 1,
        add: (state, ...values: number[]) =>
          values.reduce((a, b) => a + b, state),
      },
      selectors: {
        double: state => state * 2,
        triple: state => state * 3,
      },
    })

    expect(slice.get()).toBe(0)
    expect(slice.selectors.double.get()).toBe(0)
    expect(slice.selectors.triple.get()).toBe(0)

    slice.actions.increment()
    expect(slice.get()).toBe(1)
    expect(slice.selectors.double.get()).toBe(2)
    expect(slice.selectors.triple.get()).toBe(3)

    slice.actions.add(1, 2, 3, 4, 5)
    expect(slice.get()).toBe(16)
    expect(slice.selectors.double.get()).toBe(32)
    expect(slice.selectors.triple.get()).toBe(48)
  })
})
