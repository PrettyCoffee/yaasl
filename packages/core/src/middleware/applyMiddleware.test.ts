import { applyMiddleware } from "./applyMiddleware"
import { createAtom } from "../createAtom"

const toString = (value: number) => `number: ${value}`

describe("Test applyMiddleware", () => {
  it("Applies a getter middleware", () => {
    const atom = createAtom<null | string>(null)
    const toStringAtom = applyMiddleware(atom, {
      onGet: (value: string | null) => Number(value ?? 0),
    })

    expect(toStringAtom.get()).toBe(0)
    toStringAtom.set("42")
    expect(toStringAtom.get()).toBe(42)
  })

  it("Applies a setter middleware", () => {
    const atom = createAtom<null | string>(null)
    const toStringAtom = applyMiddleware(atom, {
      onSet: toString,
    })

    toStringAtom.set(42)
    expect(toStringAtom.get()).toBe(toString(42))
  })

  it("Applies an extension middleware", () => {
    const atom = createAtom<null | string>(null)
    const testAtom = applyMiddleware(atom, {
      extension: { test: () => 42 },
    })
    expect(testAtom.test()).toBe(42)
  })

  it("Applies a all options at once", () => {
    const atom = createAtom<null | string>(null)
    const testAtom = applyMiddleware(atom, {
      onGet: (value: string | null) => ({ value }),
      onSet: toString,
      extension: { test: () => 42, test2: () => toString(42) },
    })

    testAtom.set(42)
    expect(testAtom.get().value).toBe(toString(42))
    expect(testAtom.test()).toBe(42)
    expect(testAtom.test2()).toBe(toString(42))
  })

  it("Allows staking middlewares", () => {
    const atom = createAtom<null | string>(null)
    const testAtom = applyMiddleware(
      applyMiddleware(atom, {
        onSet: toString,
        onGet: (value: string | null) => ({ value }),
        extension: { test: () => 42 },
      }),
      {
        onSet: (value: string) => Number(value.replace(/\D*/gi, "")),
        onGet: ({ value }) => value,
        extension: { test2: () => toString(42) },
      }
    )

    testAtom.set("foo42bar")
    expect(testAtom.get()).toBe(toString(42))
    expect(testAtom.test()).toBe(42)
    expect(testAtom.test2()).toBe(toString(42))
  })

  it("Allows staking middlewares and passes setter through", () => {
    const atom = createAtom<null | string>(null)
    const testAtom = applyMiddleware(
      applyMiddleware(atom, {
        onSet: toString,
        extension: { test: () => 42 },
      }),
      {
        onGet: (value: string | null) => ({ value }),
        extension: { test2: () => toString(42) },
      }
    )

    testAtom.set(42)
    expect(testAtom.get().value).toBe(toString(42))
    expect(testAtom.test()).toBe(42)
    expect(testAtom.test2()).toBe(toString(42))
  })

  it("Allows staking middlewares and passes getter through", () => {
    const atom = createAtom<null | string>(null)
    const testAtom = applyMiddleware(
      applyMiddleware(atom, {
        onGet: (value: string | null) => ({ value }),
        extension: { test: () => 42 },
      }),
      {
        onSet: toString,
        extension: { test2: () => toString(42) },
      }
    )

    testAtom.set(42)
    expect(testAtom.get().value).toBe(toString(42))
    expect(testAtom.test()).toBe(42)
    expect(testAtom.test2()).toBe(toString(42))
  })
})
