import { middleware } from "./middleware"
import { atom } from "../core/atom"
import { store } from "../core/store"

const init = jest.fn()
const set = jest.fn()
const remove = jest.fn()
const testMiddleware = middleware({
  init,
  set,
  remove,
})

const testAtom = atom({ defaultValue: "" })

const defaultValue = "default"
const nextValue = "next"
let testStore = store()

beforeEach(() => {
  jest.resetAllMocks()
  testStore = store()
})

describe("Test middleware", () => {
  it("Creates a middleware", () => {
    const m = testMiddleware()(testAtom)
    expect(m).toHaveProperty("actions.init")
    expect(m).toHaveProperty("actions.set")
    expect(m).toHaveProperty("actions.remove")
  })

  it("Calls middleware hook on init", () => {
    const testAtom = atom({ defaultValue, middleware: [testMiddleware()] })
    testStore.init(testAtom)
    expect(init).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(init.mock.calls[0][0].value).toBe(testAtom.defaultValue)
  })

  it("Calls middleware hook on set", () => {
    const testAtom = atom({ defaultValue, middleware: [testMiddleware()] })
    testStore.init(testAtom)
    testStore.set(testAtom, nextValue)
    expect(set).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(set.mock.calls[0][0].value).toBe(nextValue)
  })

  it("Calls middleware hook on set", () => {
    const testAtom = atom({ defaultValue, middleware: [testMiddleware()] })
    testStore.init(testAtom)
    testStore.remove(testAtom)
    expect(remove).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(remove.mock.calls[0][0].value).toBeUndefined()
  })
})
