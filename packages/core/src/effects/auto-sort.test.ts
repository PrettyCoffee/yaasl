import { describe, expect, it } from "vitest"

import { createAtom } from "../base"
import { autoSort } from "./auto-sort"

const unsorted = [4, 2, 0, 3, 1]
const sortFn = (a: number, b: number) => a - b

describe("Test autoSort", () => {
  it("Sorts arrays initially", () => {
    const testAtom = createAtom({
      defaultValue: unsorted,
      effects: [autoSort({ sortFn })],
    })
    expect(testAtom.get()).toStrictEqual([0, 1, 2, 3, 4])
  })

  it("Sorts arrays when setting new value", () => {
    const testAtom = createAtom({
      defaultValue: [0, 1],
      effects: [autoSort({ sortFn })],
    })
    testAtom.set(unsorted)
    expect(testAtom.get()).toStrictEqual([0, 1, 2, 3, 4])
  })

  it("Doesn't throw with nullish values", () => {
    expect(() =>
      createAtom({ defaultValue: null, effects: [autoSort({ sortFn })] })
    ).not.toThrow()
    expect(() =>
      createAtom({ defaultValue: undefined, effects: [autoSort({ sortFn })] })
    ).not.toThrow()
  })

  it("Throws with incompatible values", () => {
    expect(() =>
      createAtom({ defaultValue: "string", effects: [autoSort({ sortFn })] })
    ).toThrow()

    const testAtom = createAtom<string | null>({
      defaultValue: null,
      effects: [autoSort({ sortFn })],
    })
    expect(() => testAtom.set("abc")).toThrow()
  })
})
