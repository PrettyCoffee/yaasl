import { it, describe, expect, afterEach } from "vitest"

import { SessionStorageOptions, sessionStorage } from "./session-storage"
import { createAtom } from "../base"
import { StringStorageParser } from "../utils/string-storage"

const defaultValue = { a: "A", b: "B" }
const nextValue = {
  c: "C",
  d: "D",
}

const setup = (options: SessionStorageOptions = {}) => {
  const testAtom = createAtom<object>({
    defaultValue,
    name: "atom",
    effects: [sessionStorage(options)],
  })
  const storeKey = options.key ?? `atom`

  const getStoreValue = (): unknown => {
    const value = window.sessionStorage.getItem(storeKey)
    return value == null ? null : JSON.parse(value)
  }

  return {
    storeKey,
    getStoreValue,
    testAtom,
  }
}

describe("Test sessionStorage", () => {
  afterEach(() => window.sessionStorage.clear())

  it("Is null initially", () => {
    const { testAtom, getStoreValue } = setup()
    expect(testAtom.get()).toStrictEqual(defaultValue)
    expect(getStoreValue()).toStrictEqual(null)
  })

  it("Loads an existing value", () => {
    window.sessionStorage.setItem(`atom`, JSON.stringify(nextValue))
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
          throw new Error("sessionStorage value is not a valid Map object")

        return new Map(value)
      },
      stringify: value => JSON.stringify([...value.entries()]),
    }

    it("Uses a custom parser", () => {
      window.sessionStorage.setItem(
        "mapAtom",
        '[["string","value"],["number",42]]'
      )
      const mapAtom = createAtom({
        name: "mapAtom",
        defaultValue: new Map(),
        effects: [sessionStorage({ parser: mapParser })],
      })
      expect(mapAtom.get().get("string")).toBe("value")
      expect(mapAtom.get().get("number")).toBe(42)
    })

    it("Uses a custom stringifier", () => {
      const testAtom = createAtom({
        name: "mapAtom",
        defaultValue: new Map<string, string | number>([]),
        effects: [sessionStorage({ parser: mapParser })],
      })
      testAtom.set(
        new Map<string, string | number>([
          ["string", "value"],
          ["number", 42],
        ])
      )
      expect(window.sessionStorage.getItem("mapAtom")).toBe(
        '[["string","value"],["number",42]]'
      )
    })
  })
})
