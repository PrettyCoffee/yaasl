import { atom } from "./atom"
import { middleware } from "../middleware"

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

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
    expect(atom({ defaultValue }).get()).toBe(defaultValue)
  })

  it("Sets the value", () => {
    const testAtom = atom({ defaultValue })
    testAtom.set(nextValue)
    expect(testAtom.get()).toBe(nextValue)
  })

  it("Unwraps a promise", async () => {
    const testAtom = atom({ defaultValue })
    await testAtom.unwrap(Promise.resolve(nextValue))
    expect(testAtom.get()).toBe(nextValue)
  })

  it("Subscribes to changes", () => {
    const action = jest.fn()
    const testAtom = atom({ defaultValue })

    testAtom.subscribe(action)
    expect(action).not.toHaveBeenCalled()
    testAtom.set(nextValue)

    expect(action).toHaveBeenCalledTimes(1)
    expect(action).toHaveBeenCalledWith(nextValue, defaultValue)
  })

  it("Unsubscribes from changes", () => {
    const action = jest.fn()
    const testAtom = atom({ defaultValue })

    const unsub = testAtom.subscribe(action)
    unsub()
    testAtom.set(nextValue)

    expect(action).not.toHaveBeenCalled()
  })

  describe("synchronizes didInit status", () => {
    it("Sets true if no midleware was passed", () => {
      const testAtom = atom({ defaultValue })
      expect(testAtom.didInit).toBe(true)
    })

    it("Sets true if middleware is sync", () => {
      const init = jest.fn()
      const didInit = jest.fn()

      const m = middleware({ init, didInit })
      const testAtom = atom({ defaultValue, middleware: [m()] })
      expect(testAtom.didInit).toBe(true)
    })

    it("Updates if middleware is async", async () => {
      const m = middleware({
        init: () => sleep(1),
        didInit: () => sleep(1),
      })
      const testAtom = atom({ defaultValue, middleware: [m()] })

      expect(testAtom.didInit).toBeInstanceOf(Promise)
      await testAtom.didInit
      expect(testAtom.didInit).toBe(true)
    })
  })
})
