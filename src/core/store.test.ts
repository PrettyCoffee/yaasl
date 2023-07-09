import { atom } from "./atom"
import { store } from "./store"
import { mockConsole } from "../utils/mockConsole"

const defaultValue = "default"
const nextValue = "next"

describe("Test store", () => {
  const testAtom = atom({ defaultValue })

  const { error, resetConsole } = mockConsole()
  afterAll(resetConsole)

  it("logs error if atom is not initialized", () => {
    const testStore = store()
    expect(testStore.get(testAtom)).toBe(undefined)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(error.mock.calls[0][0]).toMatch(
      /Initialize the atom .* in store .* before using it. \(yaasl\)/gi
    )
  })

  it("returns default value if initialized", () => {
    const testStore = store()
    testStore.init(testAtom)
    expect(testStore.get(testAtom)).toBe(defaultValue)
  })

  it("sets a value", () => {
    const testStore = store()
    testStore.init(testAtom)
    testStore.set(testAtom, nextValue)
    expect(testStore.get(testAtom)).toBe(nextValue)
  })

  it("sets a value with a callback", () => {
    const testStore = store()
    const numberAtom = atom({ defaultValue: 0 })
    testStore.init(numberAtom)
    testStore.set(numberAtom, prev => prev + 1)
    expect(testStore.get(numberAtom)).toBe(1)
  })

  it("removes an atom from the store", () => {
    const testStore = store()
    testStore.init(testAtom)
    testStore.set(testAtom, nextValue)
    testStore.remove(testAtom)
    expect(testStore.get(testAtom)).toBeUndefined()
  })

  it("subscribes to an atom", () => {
    const action = jest.fn()
    const testStore = store()
    testStore.init(testAtom)

    testStore.subscribe(testAtom, action)
    testStore.set(testAtom, nextValue)

    expect(action).toHaveBeenCalledTimes(1)
    expect(action).toHaveBeenCalledWith({ type: "set", value: nextValue })
  })

  it("subscribe returns unsubscribe function", () => {
    const action = jest.fn()
    const testStore = store()
    testStore.init(testAtom)

    const unsub = testStore.subscribe(testAtom, action)
    unsub()
    testStore.set(testAtom, nextValue)

    expect(action).not.toHaveBeenCalledTimes(1)
  })

  it("unsubscribes from an atom", () => {
    const action = jest.fn()
    const testStore = store()
    testStore.init(testAtom)

    testStore.set(testAtom, nextValue)
    testStore.subscribe(testAtom, action)
    testStore.unsubscribe(testAtom, action)
    testStore.set(testAtom, nextValue)

    expect(action).not.toHaveBeenCalled()
  })

  it("removes subscription if atom is removed", () => {
    const action = jest.fn()
    const testStore = store()
    testStore.init(testAtom)

    testStore.subscribe(testAtom, action)
    testStore.remove(testAtom)

    testStore.init(testAtom)
    testStore.set(testAtom, nextValue)

    expect(action).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(action.mock.calls[0][0]).toStrictEqual({
      type: "remove",
      value: undefined,
    })
  })

  it("handles multiple subscriptions and atoms", () => {
    const atom1 = atom({ defaultValue })
    const atom2 = atom({ defaultValue })
    const action1 = jest.fn()
    const action2 = jest.fn()
    const testStore = store()
    testStore.init([atom1, atom2])

    testStore.subscribe(atom1, action1)
    testStore.subscribe(atom2, action2)

    testStore.set(atom1, nextValue)
    expect(testStore.get(atom1)).toBe(nextValue)
    expect(testStore.get(atom2)).toBe(defaultValue)
    expect(action1).toHaveBeenCalledTimes(1)
    expect(action2).not.toHaveBeenCalled()

    testStore.set(atom2, nextValue)
    expect(testStore.get(atom1)).toBe(nextValue)
    expect(testStore.get(atom2)).toBe(nextValue)
    expect(action1).toHaveBeenCalledTimes(1)
    expect(action2).toHaveBeenCalledTimes(1)
  })
})
