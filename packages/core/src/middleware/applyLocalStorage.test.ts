import { applyLocalStorage } from "./applyLocalStorage"
import { createAtom } from "../createAtom"

const testKey = "test"
const initialValue = { a: "A", b: "B" }

const getStoreAtom = () => {
  const atom = createAtom<object>(initialValue)
  return applyLocalStorage(atom, testKey)
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

  it("Changes the value", () => {
    const atom = getStoreAtom()

    const value = {
      c: "C",
      d: "D",
    }
    atom.set(value)

    expect(atom.get()).toStrictEqual(value)
    expect(getStoreValue()).toStrictEqual(value)
  })

  it("Removes the atom from localStorage", () => {
    const atom = getStoreAtom()

    const value = {
      c: "C",
      d: "D",
    }
    atom.set(value)
    atom.remove()
    expect(getStoreValue()).toBe(null)
  })

  it("Resets the atom from localStorage", () => {
    const atom = getStoreAtom()

    const value = {
      c: "C",
      d: "D",
    }
    atom.set(value)
    atom.reset()

    expect(atom.get()).toStrictEqual(initialValue)
    expect(getStoreValue()).toStrictEqual(initialValue)
  })
})
