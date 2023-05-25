import { applyLocalStorage } from "./applyLocalStorage"
import { createAtom } from "../core"

const testKey = "test"
const initialValue = { a: "A", b: "B" }
const nextValue = {
  c: "C",
  d: "D",
}

const getStoreAtom = () => {
  const atom = createAtom<object>(initialValue)
  return applyLocalStorage(atom, { key: testKey })
}

const getStoreValue = (): unknown => {
  const value = localStorage.getItem(testKey)
  return value == null ? null : JSON.parse(value)
}

describe("Test applyLocalStorage", () => {
  it("Uses the initial value", () => {
    const atom = getStoreAtom()
    expect(atom.get()).toStrictEqual(initialValue)
    expect(getStoreValue()).toStrictEqual(initialValue)
  })

  it("Loads an existing value", () => {
    localStorage.setItem(testKey, JSON.stringify(nextValue))
    const atom = getStoreAtom()
    expect(atom.get()).toStrictEqual(nextValue)
    expect(getStoreValue()).toStrictEqual(nextValue)
  })

  it("Changes the value", () => {
    const atom = getStoreAtom()

    atom.set(nextValue)

    expect(atom.get()).toStrictEqual(nextValue)
    expect(getStoreValue()).toStrictEqual(nextValue)
  })

  it("Removes the atom from localStorage", () => {
    const atom = getStoreAtom()

    atom.set(nextValue)
    atom.remove()
    expect(getStoreValue()).toBe(null)
  })

  it("Resets the atom from localStorage", () => {
    const atom = getStoreAtom()

    atom.set(nextValue)
    atom.reset()

    expect(atom.get()).toStrictEqual(initialValue)
    expect(getStoreValue()).toStrictEqual(initialValue)
  })
})
