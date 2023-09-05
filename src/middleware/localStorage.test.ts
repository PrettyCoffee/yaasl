import { LocalStorageOptions, localStorage } from "./localStorage"
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
})
