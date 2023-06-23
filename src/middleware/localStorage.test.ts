import { localStorage } from "./localStorage"
import { atom, store } from "../core"

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
  const testStore = store({ name: "store" })
  const storeKey = key ? `store/${key}` : "store/atom"

  testStore.init(testAtom)

  const getStoreValue = (): unknown => {
    const value = window.localStorage.getItem(storeKey)
    return value == null ? null : JSON.parse(value)
  }

  const get = () => testStore.get(testAtom)
  const set = (value: object) => testStore.set(testAtom, value)
  const remove = () => testStore.remove(testAtom)

  return {
    getStoreValue,
    get,
    set,
    remove,
  }
}

describe("Test applyLocalStorage", () => {
  it("Uses the initial value", () => {
    const { get, getStoreValue } = setup()
    expect(get()).toStrictEqual(defaultValue)
    expect(getStoreValue()).toStrictEqual(defaultValue)
  })

  it("Uses the passed key", () => {
    const { get, getStoreValue } = setup("test-key")
    expect(get()).toStrictEqual(defaultValue)
    expect(getStoreValue()).toStrictEqual(defaultValue)
  })

  it("Loads an existing value", () => {
    window.localStorage.setItem("store/atom", JSON.stringify(nextValue))
    const { get } = setup()
    expect(get()).toStrictEqual(nextValue)
  })

  it("Changes the value", () => {
    const { get, getStoreValue, set } = setup()

    set(nextValue)

    expect(get()).toStrictEqual(nextValue)
    expect(getStoreValue()).toStrictEqual(nextValue)
  })

  it("Removes the atom from localStorage", () => {
    const { get, getStoreValue, set, remove } = setup()

    set(nextValue)
    remove()
    expect(getStoreValue()).toBe(null)
    expect(get()).toStrictEqual(defaultValue)
  })
})
