import {
  LocalStorageOptions,
  LocalStorageParser,
  localStorage,
} from "./localStorage"
import { atom } from "../core"

const defaultValue = { a: "A", b: "B" }
const nextValue = {
  c: "C",
  d: "D",
}

const setup = (options: LocalStorageOptions = {}) => {
  const testAtom = atom<object>({
    defaultValue,
    name: "atom",
    middleware: [localStorage(options)],
  })
  const storeKey = options.key ? options.key : `atom`

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

  it("Uses the initial value", () => {
    const { testAtom, getStoreValue } = setup()
    expect(testAtom.get()).toStrictEqual(defaultValue)
    expect(getStoreValue()).toStrictEqual(defaultValue)
  })

  it("Uses the passed key", () => {
    const { testAtom, getStoreValue } = setup({ key: "test-key" })
    expect(testAtom.get()).toStrictEqual(defaultValue)
    expect(getStoreValue()).toStrictEqual(defaultValue)
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

  it("Applies an expiration", () => {
    jest.useFakeTimers()

    const { testAtom, storeKey } = setup({ expiresIn: 300 })

    testAtom.set(nextValue)

    expect(testAtom.get()).toStrictEqual(nextValue)
    expect(window.localStorage.getItem(storeKey + "-expires-at")).toBe(
      String(Date.now() + 300)
    )

    jest.advanceTimersByTime(300)

    expect(testAtom.get()).toStrictEqual(defaultValue)
    expect(window.localStorage.getItem(storeKey + "-expires-at")).toBeNull()

    jest.useRealTimers()
  })

  describe("handles custom parsers", () => {
    const isMapEntry = (value: unknown): value is [unknown, unknown] =>
      Array.isArray(value) && value.length === 2

    const mapParser: LocalStorageParser<Map<unknown, unknown>> = {
      parse: text => {
        const value: unknown = JSON.parse(text)
        if (!Array.isArray(value) || !value.every(isMapEntry))
          throw new Error("LocalStorage value is not a valid Map object")

        return new Map(value)
      },
      stringify: value => JSON.stringify(Array.from(value.entries())),
    }

    it("Uses a custom parser", () => {
      window.localStorage.setItem(
        "mapAtom",
        '[["string","value"],["number",42]]'
      )
      const mapAtom = atom({
        name: "mapAtom",
        defaultValue: new Map(),
        middleware: [localStorage({ parser: mapParser })],
      })
      expect(mapAtom.get().get("string")).toBe("value")
      expect(mapAtom.get().get("number")).toBe(42)
    })

    it("Uses a custom stringifier", () => {
      atom({
        name: "mapAtom",
        defaultValue: new Map<string, string | number>([
          ["string", "value"],
          ["number", 42],
        ]),
        middleware: [localStorage({ parser: mapParser })],
      })
      expect(window.localStorage.getItem("mapAtom")).toBe(
        '[["string","value"],["number",42]]'
      )
    })
  })
})
