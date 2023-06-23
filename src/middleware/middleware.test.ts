import { middleware } from "./middleware"
import { atom } from "../core/atom"
import { store } from "../core/store"

const hook = jest.fn()
const testMiddleware = middleware(hook)

const defaultValue = "default"
const nextValue = "next"
let testStore = store()

beforeEach(() => {
  jest.resetAllMocks()
  testStore = store()
})

describe("Test middleware", () => {
  it("Creates a middleware", () => {
    expect(testMiddleware()).toHaveProperty("hook", hook)
  })

  it("Calls middleware hook on init", () => {
    const testAtom = atom({ defaultValue, middleware: [testMiddleware()] })
    testStore.init(testAtom)
    expect(hook).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(hook.mock.calls[0][0].type).toBe("INIT")
  })

  it("Calls middleware hook on set", () => {
    const testAtom = atom({ defaultValue, middleware: [testMiddleware()] })
    testStore.set(testAtom, nextValue)
    expect(hook).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(hook.mock.calls[0][0].type).toBe("SET")
  })

  it("Calls middleware hook on set", () => {
    const testAtom = atom({ defaultValue, middleware: [testMiddleware()] })
    testStore.remove(testAtom)
    expect(hook).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(hook.mock.calls[0][0].type).toBe("REMOVE")
  })
})
