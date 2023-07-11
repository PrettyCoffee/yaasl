import { localStorage } from "./localStorage"
import { atom } from "../core"

const defaultValue = { a: "A", b: "B" }
const nextValue = {
  c: "C",
  d: "D",
}

const setup = (key?: string) => {
  const testAtom = atom<object>({
    defaultValue,
    name: "atom",
    middleware: [localStorage({ key })],
  })
  const storeKey = key ? key : `atom`

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

describe("Test applyLocalStorage", () => {
  it("Uses the initial value", () => {
    const { testAtom, getStoreValue } = setup()
    expect(testAtom.get()).toStrictEqual(defaultValue)
    expect(getStoreValue()).toStrictEqual(defaultValue)
  })

  it("Uses the passed key", () => {
    const { testAtom, getStoreValue } = setup("test-key")
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
})
