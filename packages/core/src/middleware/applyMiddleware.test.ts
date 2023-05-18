import { applyMiddleware } from "./applyMiddleware"
import { createAtom } from "../createAtom"

describe("Test applyMiddleware", () => {
  it("Applies a getter middleware", () => {
    const get = jest.fn()
    const initialValue = null
    const nextValue = "42"
    const atom = createAtom<string | null>(initialValue)

    const middleware = applyMiddleware(atom, {
      onGet: get,
    })

    expect(middleware.get()).toBe(initialValue)

    middleware.set(nextValue)
    expect(middleware.get()).toBe(nextValue)

    expect(get).toHaveBeenCalledTimes(2)
    expect(get).toHaveBeenNthCalledWith(1, initialValue)
    expect(get).toHaveBeenNthCalledWith(2, nextValue)
  })

  it("Applies a setter middleware", () => {
    const set = jest.fn()
    const initialValue = null
    const nextValue = "42"
    const atom = createAtom<string | null>(initialValue)

    const middleware = applyMiddleware(atom, {
      onSet: set,
    })

    middleware.set(nextValue)
    expect(set).toHaveBeenCalledTimes(1)
    expect(set).toHaveBeenCalledWith(nextValue)
    expect(middleware.get()).toBe(nextValue)
  })

  it("Applies an extension middleware", () => {
    const atom = createAtom<null | string>(null)
    const testAtom = applyMiddleware(atom, {
      extension: { test: () => 42 },
    })
    expect(testAtom.test()).toBe(42)
  })

  it("Applies all options at once", () => {
    const get = jest.fn()
    const set = jest.fn()
    const initialValue = null
    const nextValue = "42"
    const atom = createAtom<string | null>(initialValue)

    const middleware = applyMiddleware(atom, {
      onGet: get,
      onSet: set,
      extension: { test: () => 42 },
    })

    middleware.set(nextValue)
    expect(middleware.get()).toBe(nextValue)

    expect(set).toHaveBeenCalledTimes(1)
    expect(set).toHaveBeenCalledWith(nextValue)

    expect(get).toHaveBeenCalledTimes(1)
    expect(get).toHaveBeenCalledWith(nextValue)

    expect(middleware.test()).toBe(42)
  })

  it("Allows staking middlewares", () => {
    const get = jest.fn()
    const set = jest.fn()
    const initialValue = null
    const nextValue = "42"
    const atom = createAtom<string | null>(initialValue)

    const first = applyMiddleware(atom, {
      onGet: get,
      onSet: set,
      extension: { test: () => 42 },
    })
    const middleware = applyMiddleware(first, {
      onGet: get,
      onSet: set,
      extension: { test2: () => 43 },
    })

    middleware.set(nextValue)
    expect(middleware.get()).toBe(nextValue)

    expect(set).toHaveBeenCalledTimes(2)
    expect(set).toHaveBeenNthCalledWith(1, nextValue)
    expect(set).toHaveBeenNthCalledWith(2, nextValue)

    expect(get).toHaveBeenCalledTimes(2)
    expect(get).toHaveBeenNthCalledWith(1, nextValue)
    expect(get).toHaveBeenNthCalledWith(2, nextValue)

    expect(middleware.test()).toBe(42)
    expect(middleware.test2()).toBe(43)
  })
})
