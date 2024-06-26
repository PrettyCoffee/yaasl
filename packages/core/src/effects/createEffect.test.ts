import { sleep } from "@yaasl/utils"

import { createEffect } from "./createEffect"
import { createAtom } from "../base"

const didInit = vi.fn()
const init = vi.fn()
const set = vi.fn()
const testEffect = createEffect({
  init,
  didInit,
  set,
})

const defaultValue = "default"
const nextValue = "next"

const testAtom = createAtom({ defaultValue })

beforeEach(() => {
  vi.resetAllMocks()
})

describe("Test createEffect", () => {
  it("Creates an effect", () => {
    const e = testEffect()(testAtom)
    expect(e.actions).toHaveProperty("set")
    expect(e).toHaveProperty("options")
  })

  it("Accepts options", () => {
    const testEffect = createEffect<{ a: string }>({
      init,
      set,
    })

    const e = testEffect({ a: "testOptionValue" })(testAtom)
    expect(e).toHaveProperty("options.a", "testOptionValue")
  })

  it("Calls the init function", () => {
    const testAtom = createAtom({
      defaultValue,
      effects: [testEffect()],
    })
    expect(init).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const callArgs = init.mock.calls[0][0]
    expect(callArgs).toHaveProperty("atom", testAtom)
    expect(callArgs).toHaveProperty("value", defaultValue)
    expect(callArgs).toHaveProperty("options", undefined)
  })

  it("Calls the didInit function", () => {
    const testAtom = createAtom({
      defaultValue,
      effects: [testEffect()],
    })
    expect(didInit).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const callArgs = didInit.mock.calls[0][0]
    expect(callArgs).toHaveProperty("atom", testAtom)
    expect(callArgs).toHaveProperty("value", defaultValue)
    expect(callArgs).toHaveProperty("options", undefined)
  })

  it("Sets the value in the effect", () => {
    const counter = createEffect<undefined, number>({
      init: ({ set }) => set(0),
      didInit: ({ set, value }) => set(value + 1),
      set: ({ set, value }) => set(value + 1),
    })
    const atom = createAtom({
      defaultValue: 50,
      effects: [counter()],
    })
    expect(atom.get()).toBe(1) // 50 -> init effect 0 -> didInit effect 1
    atom.set(count => count + 1) // 1 -> set 2 -> set effect 3
    atom.set(count => count + 1) // 3 -> set 4 -> set effect 5
    expect(atom.get()).toBe(5)
  })

  it("Calls the set function", () => {
    const testAtom = createAtom({
      defaultValue,
      effects: [testEffect()],
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

    const order = createEffect(() => {
      actionOrder.push("setup")
      return {
        init: () => {
          actionOrder.push("init")
        },
        didInit: ({ set }) => {
          actionOrder.push("didInit")
          set(nextValue)
        },
        set: () => {
          actionOrder.push("set")
        },
      }
    })

    const testAtom = createAtom({
      defaultValue,
      effects: [order()],
    })

    expect(actionOrder).toEqual(["setup", "init", "didInit"])
    expect(testAtom.get()).toBe(nextValue)
    testAtom.set("next2")
    expect(actionOrder).toEqual(["setup", "init", "didInit", "set"])
  })

  it("Sets didInit to true when no effect was asynchronous", () => {
    const testAtom = createAtom({
      defaultValue,
      effects: [testEffect()],
    })

    expect(testAtom.didInit).toBe(true)
  })

  it.each`
    initType   | didInitType
    ${"sync"}  | ${"sync"}
    ${"sync"}  | ${"async"}
    ${"async"} | ${"sync"}
    ${"async"} | ${"async"}
  `(
    "uses correct previous value if { init: $initType, didInit: $didInitType }",
    async ({ initType, didInitType }) => {
      const values: number[] = []

      const next = (value: number) => {
        values.push(value)
        return value + 1
      }

      const counterEffect = createEffect<undefined, number>({
        init: ({ value, set }) => {
          if (initType === "sync") {
            set(next(value))
            return
          }
          return sleep(10).then(() => set(next(value)))
        },
        didInit: ({ value, set }) => {
          if (didInitType === "sync") {
            set(next(value))
            return
          }
          return sleep(10).then(() => set(next(value)))
        },
      })
      const testAtom = createAtom({
        defaultValue: 0,
        effects: [counterEffect()],
      })

      await testAtom.didInit
      expect(values).toStrictEqual([0, 1])
      expect(testAtom.get()).toBe(2)
      expect(testAtom.didInit).toBe(true)
    }
  )

  describe("Async effect", () => {
    it("allows async init", async () => {
      const actionOrder: string[] = []

      const order = createEffect({
        init: () =>
          sleep(10).then(() => {
            actionOrder.push("init")
          }),
        didInit: () => {
          actionOrder.push("didInit")
        },
      })

      const testAtom = createAtom({
        defaultValue,
        effects: [order()],
      })

      expect(actionOrder).toEqual([])
      await testAtom.didInit
      expect(actionOrder).toEqual(["init", "didInit"])
      expect(testAtom.didInit).toBe(true)
    })

    it("allows async didInit", async () => {
      const actionOrder: string[] = []

      const order = createEffect({
        init: () => {
          actionOrder.push("init")
        },
        didInit: () =>
          sleep(10).then(() => {
            actionOrder.push("didInit")
          }),
      })

      const testAtom = createAtom({
        defaultValue,
        effects: [order()],
      })

      expect(actionOrder).toEqual(["init"])
      await testAtom.didInit
      expect(actionOrder).toEqual(["init", "didInit"])
      expect(testAtom.didInit).toBe(true)
    })

    it("allows init and didInit to be async", async () => {
      const actionOrder: string[] = []

      const order = createEffect(() => {
        actionOrder.push("setup")
        return {
          init: () =>
            sleep(10).then(() => {
              actionOrder.push("init")
            }),
          didInit: () =>
            sleep(5).then(() => {
              actionOrder.push("didInit")
            }),
        }
      })

      const testAtom = createAtom({
        defaultValue,
        effects: [order()],
      })

      expect(actionOrder).toEqual(["setup"])
      await testAtom.didInit
      expect(actionOrder).toEqual(["setup", "init", "didInit"])
      expect(testAtom.didInit).toBe(true)
    })

    it("persists the value over multiple async effect actions", async () => {
      const values: number[] = []
      const counterEffect = createEffect<undefined, number>({
        init: ({ value, set }) => {
          return sleep(10).then(() => {
            values.push(value)
            set(value + 1)
          })
        },
        didInit: ({ value, set }) => {
          return sleep(10).then(() => {
            values.push(value)
            set(value + 1)
          })
        },
      })
      const testAtom = createAtom({
        defaultValue: 0,
        effects: [counterEffect()],
      })

      await testAtom.didInit
      expect(values).toStrictEqual([0, 1])
      expect(testAtom.get()).toBe(2)
    })
  })
})
