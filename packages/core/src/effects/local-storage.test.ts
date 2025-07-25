import { it, describe, expect, afterEach } from "vitest"

import { LocalStorageOptions, localStorage } from "./local-storage"
import { createAtom } from "../base"
import { StringStorageParser } from "../utils/string-storage"

const defaultValue = { a: "A", b: "B" }
const nextValue = {
  c: "C",
  d: "D",
}

const setup = (options: LocalStorageOptions = {}) => {
  const testAtom = createAtom<object>({
    defaultValue,
    name: "atom",
    effects: [localStorage(options)],
  })
  const storeKey = options.key ?? `atom`

  const getStoreValue = (): unknown => {
    const value = window.localStorage.getItem(storeKey)
    return value == null ? null : JSON.parse(value)
  }

  return {
    storeKey,
    getStoreValue,
    testAtom,
  }
}

describe("Test localStorage", () => {
  afterEach(() => window.localStorage.clear())

  it("Is null initially", () => {
    const { testAtom, getStoreValue } = setup()
    expect(testAtom.get()).toStrictEqual(defaultValue)
    expect(getStoreValue()).toStrictEqual(null)
  })

  it("Loads an existing value", () => {
    window.localStorage.setItem(`atom`, JSON.stringify(nextValue))
    const { testAtom } = setup()
    expect(testAtom.get()).toStrictEqual(nextValue)
  })

  it("Changes the value", () => {
    const { testAtom, getStoreValue } = setup()

    testAtom.set(nextValue)

    expect(testAtom.get()).toStrictEqual(nextValue)
    expect(getStoreValue()).toStrictEqual(nextValue)
  })

  it("Uses the passed key", () => {
    const { testAtom, getStoreValue } = setup({ key: "test-key" })

    testAtom.set(nextValue)

    expect(testAtom.get()).toStrictEqual(nextValue)
    expect(getStoreValue()).toStrictEqual(nextValue)
  })

  describe("handles custom parsers", () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const isMapEntry = (value: unknown): value is [unknown, unknown] =>
      Array.isArray(value) && value.length === 2

    const mapParser: StringStorageParser<Map<unknown, unknown>> = {
      parse: text => {
        const value: unknown = JSON.parse(text)
        if (!Array.isArray(value) || !value.every(isMapEntry))
          throw new Error("LocalStorage value is not a valid Map object")

        return new Map(value)
      },
      stringify: value => JSON.stringify([...value.entries()]),
    }

    it("Uses a custom parser", () => {
      window.localStorage.setItem(
        "mapAtom",
        '[["string","value"],["number",42]]'
      )
      const mapAtom = createAtom({
        name: "mapAtom",
        defaultValue: new Map(),
        effects: [localStorage({ parser: mapParser })],
      })
      expect(mapAtom.get().get("string")).toBe("value")
      expect(mapAtom.get().get("number")).toBe(42)
    })

    it("Uses a custom stringifier", () => {
      const testAtom = createAtom({
        name: "mapAtom",
        defaultValue: new Map<string, string | number>([]),
        effects: [localStorage({ parser: mapParser })],
      })
      testAtom.set(
        new Map<string, string | number>([
          ["string", "value"],
          ["number", 42],
        ])
      )
      expect(window.localStorage.getItem("mapAtom")).toBe(
        '[["string","value"],["number",42]]'
      )
    })
  })
})
