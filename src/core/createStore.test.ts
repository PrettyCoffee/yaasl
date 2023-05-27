import { createAtom } from "./createAtom"
import { createStore } from "./createStore"

const defaultValue = "test"
const nextValue = "next-test"

describe("Test store", () => {
  it("Sets and gets atom values", () => {
    const store = createStore()
    const atom = createAtom(defaultValue)

    expect(store.get(atom)).toBe(defaultValue)

    store.set(atom, nextValue)
    expect(store.get(atom)).toBe(nextValue)
  })

  it("Removes an atom", () => {
    const store = createStore()
    const atom = createAtom(defaultValue)

    store.set(atom, nextValue)
    store.remove(atom)
    expect(store.get(atom)).toBe(defaultValue)
  })

  it("Subscribes to changes", () => {
    const store = createStore()
    const atom = createAtom(defaultValue)
    const sub = jest.fn()

    store.subscribe(atom, sub)

    expect(sub).not.toHaveBeenCalled()

    store.set(atom, nextValue)
    expect(sub).toHaveBeenCalledTimes(1)
    expect(sub).toHaveBeenLastCalledWith(nextValue)

    store.set(atom, nextValue + "2")
    expect(sub).toHaveBeenCalledTimes(2)
    expect(sub).toHaveBeenLastCalledWith(nextValue + "2")
  })

  it("Removes a subscription", () => {
    const store = createStore()
    const atom = createAtom(defaultValue)
    const sub = jest.fn()

    store.subscribe(atom, sub)

    store.set(atom, nextValue)
    expect(sub).toHaveBeenCalledTimes(1)

    store.unsubscribe(atom, sub)

    store.set(atom, nextValue + "2")
    expect(sub).toHaveBeenCalledTimes(1)
  })

  it("Sets and gets multiple atoms", () => {
    const store = createStore()
    const atom1 = createAtom(defaultValue)
    const atom2 = createAtom(defaultValue)
    const sub = jest.fn()

    store.subscribe(atom2, sub)
    expect(sub).not.toHaveBeenCalled()

    store.set(atom1, nextValue)
    expect(store.get(atom1)).toBe(nextValue)
    expect(sub).not.toHaveBeenCalled()

    store.set(atom2, nextValue + "2")
    expect(store.get(atom2)).toBe(nextValue + "2")
    expect(sub).toHaveBeenCalledTimes(1)
  })
})
