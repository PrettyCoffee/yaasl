import { atom } from "./atom"

const defaultValue = "default"
const nextValue = "next"

beforeEach(() => jest.resetAllMocks())

describe("Test atom", () => {
  it("Creates an atom with default value", () => {
    expect(atom({ defaultValue })).toHaveProperty("defaultValue", defaultValue)
  })

  it("Creates an atom with unique name", () => {
    expect(atom({ defaultValue }).name).toMatch(/atom-\d+/)
  })

  it("Creates an atom with custom name", () => {
    const name = "test"
    expect(atom({ defaultValue, name })).toHaveProperty("name", name)
  })

  it("Returns the defaultValue initially", () => {
    expect(atom({ defaultValue }).snapshot()).toBe(defaultValue)
  })

  it("Sets the value", () => {
    const testAtom = atom({ defaultValue })
    testAtom.set(nextValue)
    expect(testAtom.snapshot()).toBe(nextValue)
  })

  it("Subscribes to changes", () => {
    const action = jest.fn()
    const testAtom = atom({ defaultValue })

    testAtom.subscribe(action)
    expect(action).not.toHaveBeenCalled()
    testAtom.set(nextValue)

    expect(action).toHaveBeenCalledTimes(1)
    expect(action).toHaveBeenCalledWith(nextValue)
  })

  it("Unsubscribes from changes", () => {
    const action = jest.fn()
    const testAtom = atom({ defaultValue })

    const unsub = testAtom.subscribe(action)
    unsub()
    testAtom.set(nextValue)

    expect(action).not.toHaveBeenCalled()
  })
})
