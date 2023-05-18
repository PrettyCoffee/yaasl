import { createMiddleware } from "./createMiddleware"
import { createAtom } from "../createAtom"

const initialValue = null
const nextValue = "42"
const getAtom = () => createAtom<string | null>(initialValue)

type Extension<K extends string = "ext"> = Record<K, (value: number) => number>
interface Options {
  option: string
}

describe("Test createMiddleware", () => {
  it("Creates a getter middleware", () => {
    const get = jest.fn()

    const getter = createMiddleware({
      onGet: value => {
        get(value)
      },
    })
    const atom = getter(getAtom())

    expect(atom.get()).toBe(initialValue)

    atom.set(nextValue)
    expect(atom.get()).toBe(nextValue)

    expect(get).toHaveBeenCalledTimes(2)
    expect(get).toHaveBeenNthCalledWith(1, initialValue)
    expect(get).toHaveBeenNthCalledWith(2, nextValue)
  })

  it("Creates a setter middleware", () => {
    const set = jest.fn()

    const setter = createMiddleware({
      onSet: value => {
        set(value)
      },
    })
    const atom = setter(getAtom())

    atom.set(nextValue)
    expect(set).toHaveBeenCalledTimes(1)
    expect(set).toHaveBeenCalledWith(nextValue)
    expect(atom.get()).toBe(nextValue)
  })

  it("Creates an extension middleware", () => {
    const ext = jest.fn()

    const withExt = createMiddleware<undefined, Extension>({
      createExtension: () => ({
        ext: (value: number) => {
          ext(value)
          return value
        },
      }),
    })
    const atom = withExt(getAtom())

    const value = 42
    atom.ext(value)
    expect(ext).toHaveBeenCalledTimes(1)
    expect(ext).toHaveBeenCalledWith(value)
  })

  it("Creates a middleware with all options at once", () => {
    const get = jest.fn()
    const set = jest.fn()
    const ext = jest.fn()

    const withAll = createMiddleware<undefined, Extension>({
      onGet: value => {
        get(value)
      },
      onSet: value => {
        set(value)
      },
      createExtension: () => ({
        ext: (value: number) => {
          ext(value)
          return value
        },
      }),
    })
    const atom = withAll(getAtom())

    atom.set(nextValue)
    expect(atom.get()).toBe(nextValue)

    expect(atom.ext(42)).toBe(42)
    expect(set).toHaveBeenCalled()
    expect(get).toHaveBeenCalled()
    expect(ext).toHaveBeenCalled()
  })

  it("Allows a function as setup and passes config down", () => {
    const get = jest.fn()
    const set = jest.fn()
    const ext = jest.fn()

    const options: Options = {
      option: "test",
    }

    const withAll = createMiddleware<Options, Extension>(({ options }) => {
      expect(options.option).toBe("test")
      return {
        onGet: (value, { options }) => {
          expect(options.option).toBe("test")
          get(value)
        },
        onSet: (value, { options }) => {
          expect(options.option).toBe("test")
          set(value)
        },
        createExtension: ({ options }) => {
          expect(options.option).toBe("test")
          return {
            ext: (value: number) => {
              ext(value)
              return value
            },
          }
        },
      }
    })
    const atom = withAll(getAtom(), options)

    atom.set(nextValue)
    expect(atom.get()).toBe(nextValue)

    expect(atom.ext(42)).toBe(42)
    expect(set).toHaveBeenCalled()
    expect(get).toHaveBeenCalled()
    expect(ext).toHaveBeenCalled()
  })

  it("Allows staking middlewares", () => {
    const get = jest.fn()
    const set = jest.fn()
    const aExt = jest.fn()
    const bExt = jest.fn()

    const first = createMiddleware<undefined, Extension<"a">>({
      onGet: value => {
        get(value)
      },
      onSet: value => {
        set(value)
      },
      createExtension: () => ({
        a: (value: number) => {
          aExt(value)
          return value
        },
      }),
    })
    const second = createMiddleware<undefined, Extension<"b">>({
      onGet: value => {
        get(value)
      },
      onSet: value => {
        set(value)
      },
      createExtension: () => ({
        b: (value: number) => {
          bExt(value)
          return value
        },
      }),
    })
    const atom = second(first(getAtom()))

    atom.set(nextValue)
    expect(atom.get()).toBe(nextValue)

    expect(atom.a(42)).toBe(42)
    expect(atom.b(42)).toBe(42)
    expect(aExt).toHaveBeenCalled()
    expect(bExt).toHaveBeenCalled()

    expect(set).toHaveBeenCalledTimes(2)
    expect(set).toHaveBeenNthCalledWith(1, nextValue)
    expect(set).toHaveBeenNthCalledWith(2, nextValue)

    expect(get).toHaveBeenCalledTimes(2)
    expect(get).toHaveBeenNthCalledWith(1, nextValue)
    expect(get).toHaveBeenNthCalledWith(2, nextValue)
  })
})
