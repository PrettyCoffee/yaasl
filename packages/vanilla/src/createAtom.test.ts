import { createAtom } from "./createAtom"

const value = "test"
const nextValue = "test 2"

describe("Test createAtom", () => {
  it("Creates an atom with initial value", () => {
    const atom = createAtom(value)
    expect(atom.get()).toBe(value)
  })

  it("Sets an atoms value", () => {
    const atom = createAtom(value)
    atom.set(nextValue)
    expect(atom.get()).toBe(nextValue)
  })

  it("Subscribes to changes", () => {
    const action = jest.fn()
    const atom = createAtom(value)
    atom.subscribe(action)
    atom.set(nextValue)

    expect(action).toHaveBeenCalledTimes(1)
    expect(action).toHaveBeenCalledWith(nextValue)
  })

  it("Unsubscribes from changes", () => {
    const action = jest.fn()
    const atom = createAtom(value)

    atom.subscribe(action)
    atom.unsubscribe(action)
    atom.set(nextValue)

    expect(action).not.toHaveBeenCalled()
  })

  it("Can handle multiple subscriptions", () => {
    const action1 = jest.fn()
    const action2 = jest.fn()
    const atom = createAtom(value)

    atom.subscribe(action1)
    atom.subscribe(action2)
    atom.set(nextValue)

    expect(action1).toHaveBeenCalledTimes(1)
    expect(action1).toHaveBeenCalledWith(nextValue)
    expect(action2).toHaveBeenCalledTimes(1)
    expect(action2).toHaveBeenCalledWith(nextValue)

    const otherValue = "test 3"
    atom.unsubscribe(action1)
    atom.set(otherValue)

    expect(action1).toHaveBeenCalledTimes(1)
    expect(action1).toHaveBeenCalledWith(nextValue)
    expect(action2).toHaveBeenCalledTimes(2)
    expect(action2).toHaveBeenCalledWith(otherValue)
  })

  it("Does not change value if it is the same", () => {
    const action = jest.fn()
    const atom = createAtom(value)
    atom.subscribe(action)
    atom.set(value)

    expect(action).not.toHaveBeenCalled()
  })
})
