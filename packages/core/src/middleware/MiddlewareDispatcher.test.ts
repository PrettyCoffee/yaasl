import { middleware } from "./middleware"
import { MiddlewareDispatcher } from "./MiddlewareDispatcher"
import { atom } from "../base"

const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(() => resolve(true), ms))

interface TestOptions {
  types: {
    initType: "sync" | "async"
    didInitType: "sync" | "async"
  }
  labels: [string, string, string]
  onEmit: (value: string) => void
  wait?: number
}
const createMiddleware = ({
  onEmit,
  types: { initType, didInitType },
  labels: [init, didInit, set],
  wait = 10,
}: TestOptions) =>
  middleware({
    init: () => {
      return initType === "sync"
        ? onEmit(init)
        : sleep(wait).then(() => onEmit(init))
    },
    didInit: () => {
      return didInitType === "sync"
        ? onEmit(didInit)
        : sleep(wait).then(() => onEmit(didInit))
    },
    set: () => onEmit(set),
  })

describe("Test MiddlewareDispatcher", () => {
  describe.each`
    initType   | didInitType
    ${"sync"}  | ${"sync"}
    ${"sync"}  | ${"async"}
    ${"async"} | ${"sync"}
    ${"async"} | ${"async"}
  `(
    "{ init: $initType, didInit: $didInitType }",
    (types: TestOptions["types"]) => {
      const testFn = jest.fn()
      const m = createMiddleware({
        types: types,
        labels: ["init", "didInit", "set"],
        onEmit: testFn,
      })

      beforeEach(() => {
        testFn.mockClear()
      })

      it("sets the didInit status correctly", async () => {
        const testAtom = atom({ defaultValue: 0 })

        const dispatcher = new MiddlewareDispatcher({
          atom: testAtom,
          middleware: [m()],
        })

        if (types.initType === "async" || types.didInitType === "async") {
          expect(dispatcher.didInit).toBeInstanceOf(Promise)
          await dispatcher.didInit
        }
        expect(dispatcher.didInit).toBe(true)
      })

      it("calls init and didInit", async () => {
        const testAtom = atom({ defaultValue: 0 })

        const dispatcher = new MiddlewareDispatcher({
          atom: testAtom,
          middleware: [m()],
        })

        await dispatcher.didInit
        expect(testFn.mock.calls.flat()).toStrictEqual(["init", "didInit"])
      })
    }
  )

  it("waits for all tasks to finish", async () => {
    const testFn = jest.fn()
    const testAtom = atom({ defaultValue: 0 })
    const m1 = createMiddleware({
      types: { initType: "async", didInitType: "async" },
      labels: ["init1", "didInit1", "set1"],
      onEmit: testFn,
      wait: 5,
    })
    const m2 = createMiddleware({
      types: { initType: "async", didInitType: "async" },
      labels: ["init2", "didInit2", "set2"],
      onEmit: testFn,
      wait: 1,
    })

    const dispatcher = new MiddlewareDispatcher({
      atom: testAtom,
      middleware: [m1(), m2()],
    })

    const getMocks = () => testFn.mock.calls.flat() as string[]

    expect(dispatcher.didInit).toBeInstanceOf(Promise)
    expect(getMocks()).toStrictEqual([])
    await dispatcher.didInit
    expect(getMocks()).toStrictEqual(["init2", "init1", "didInit2", "didInit1"])
    testAtom.set(1)
    expect(getMocks()).toStrictEqual([
      "init2",
      "init1",
      "didInit2",
      "didInit1",
      "set1",
      "set2",
    ])
  })
})
