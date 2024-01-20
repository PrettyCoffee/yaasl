import { middleware } from "./middleware"
import { atom } from "../core"

const didInit = jest.fn()
const init = jest.fn()
const set = jest.fn()
const testMiddleware = middleware({
  init,
  didInit,
  set,
})

const defaultValue = "default"
const nextValue = "next"

const testAtom = atom({ defaultValue })

beforeEach(() => {
  jest.resetAllMocks()
})

describe("Test middleware", () => {
  it("Creates a middleware", () => {
    const m = testMiddleware()(testAtom)
    expect(m.actions).toHaveProperty("set")
    expect(m).toHaveProperty("options")
  })

  it("Accepts options", () => {
    const testMiddleware = middleware<{ a: string }>({
      init,
      set,
    })

    const m = testMiddleware({ a: "testOptionValue" })(testAtom)
    expect(m).toHaveProperty("options.a", "testOptionValue")
  })

  it("Calls the init function", () => {
    const testAtom = atom({
      defaultValue,
      middleware: [testMiddleware()],
    })
    expect(init).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const callArgs = init.mock.calls[0][0]
    expect(callArgs).toHaveProperty("atom", testAtom)
    expect(callArgs).toHaveProperty("value", defaultValue)
    expect(callArgs).toHaveProperty("options", undefined)
  })

  it("Calls the didInit function", () => {
    const testAtom = atom({
      defaultValue,
      middleware: [testMiddleware()],
    })
    expect(didInit).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const callArgs = didInit.mock.calls[0][0]
    expect(callArgs).toHaveProperty("atom", testAtom)
    expect(callArgs).toHaveProperty("value", defaultValue)
    expect(callArgs).toHaveProperty("options", undefined)
  })

  it("Calls the set function", () => {
    const testAtom = atom({
      defaultValue,
      middleware: [testMiddleware()],
    })
    testAtom.set(nextValue)
    expect(set).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const callArgs = set.mock.calls[0][0]
    expect(callArgs).toHaveProperty("atom", testAtom)
    expect(callArgs).toHaveProperty("value", nextValue)
    expect(callArgs).toHaveProperty("options", undefined)
  })

  it("Calls the actions in the correct order", () => {
    const actionOrder: string[] = []

    const order = middleware(() => ({
      init: () => actionOrder.push("init"),
      didInit: ({ atom }) => {
        actionOrder.push("didInit")
        atom.set(nextValue)
      },
      set: () => actionOrder.push("set"),
    }))

    const testAtom = atom({
      defaultValue,
      middleware: [order()],
    })

    expect(actionOrder).toEqual(["init", "didInit", "set"])
    testAtom.set("next2")
    expect(actionOrder).toEqual(["init", "didInit", "set", "set"])
  })
})
