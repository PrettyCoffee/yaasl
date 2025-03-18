import { sleep } from "@yaasl/utils"
import { vi, it, describe, expect, beforeEach } from "vitest"

import { createEffect } from "./createEffect"
import { createAtom } from "../base"

const callHistory = createEffect<{
  sort?: "pre" | "post"
  call: (item: string) => void
  asyncInit?: boolean
  asyncDidInit?: boolean
}>(({ options }) => {
  const { sort, call, asyncInit, asyncDidInit } = options
  const addItem = (item: string) => {
    call(item)
  }

  return {
    sort,
    init: () =>
      !asyncInit ? addItem("init") : sleep(10).then(() => addItem("init")),
    didInit: () =>
      !asyncDidInit
        ? addItem("didInit")
        : sleep(10).then(() => addItem("didInit")),
    set: () => addItem("set"),
  }
})

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const callArgs = init.mock.calls[0]?.[0]
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const callArgs = didInit.mock.calls[0]?.[0]
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const callArgs = set.mock.calls[0]?.[0]
    expect(callArgs).toHaveProperty("atom", testAtom)
    expect(callArgs).toHaveProperty("value", nextValue)
    expect(callArgs).toHaveProperty("options", undefined)
  })

  it("Calls the actions in the correct order", () => {
    const actionOrder: string[] = []
    const order = callHistory({ call: item => actionOrder.push(item) })
    const testAtom = createAtom({
      defaultValue,
      effects: [order],
    })

    expect(actionOrder).toEqual(["init", "didInit"])
    testAtom.set(nextValue)
    expect(actionOrder).toEqual(["init", "didInit", "set"])
  })

  it("Applies effect pre sort", () => {
    const actionOrder: string[] = []

    const pre = callHistory({
      sort: "pre",
      call: item => actionOrder.push("pre-" + item),
    })
    const base = callHistory({
      call: item => actionOrder.push("base-" + item),
    })

    const testAtom = createAtom({
      defaultValue,
      effects: [base, pre],
    })

    const init = ["pre-init", "base-init", "pre-didInit", "base-didInit"]
    expect(actionOrder).toStrictEqual(init)
    testAtom.set(nextValue)
    expect(actionOrder).toStrictEqual([...init, "pre-set", "base-set"])
  })

  it("Applies effect post sort", () => {
    const actionOrder: string[] = []

    const post = callHistory({
      sort: "post",
      call: item => actionOrder.push("post-" + item),
    })
    const base = callHistory({
      call: item => actionOrder.push("base-" + item),
    })

    const testAtom = createAtom({
      defaultValue,
      effects: [post, base],
    })

    const init = ["base-init", "post-init", "base-didInit", "post-didInit"]
    expect(actionOrder).toStrictEqual(init)
    testAtom.set(nextValue)
    expect(actionOrder).toStrictEqual([...init, "base-set", "post-set"])
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

      const order = callHistory({
        call: item => actionOrder.push(item),
        asyncInit: true,
      })

      const testAtom = createAtom({
        defaultValue,
        effects: [order],
      })

      expect(actionOrder).toEqual([])
      await testAtom.didInit
      expect(actionOrder).toEqual(["init", "didInit"])
      expect(testAtom.didInit).toBe(true)
    })

    it("allows async didInit", async () => {
      const actionOrder: string[] = []

      const order = callHistory({
        call: item => actionOrder.push(item),
        asyncDidInit: true,
      })

      const testAtom = createAtom({
        defaultValue,
        effects: [order],
      })

      expect(actionOrder).toEqual(["init"])
      await testAtom.didInit
      expect(actionOrder).toEqual(["init", "didInit"])
      expect(testAtom.didInit).toBe(true)
    })

    it("allows init and didInit to be async", async () => {
      const actionOrder: string[] = []

      const order = callHistory({
        call: item => actionOrder.push(item),
        asyncInit: true,
        asyncDidInit: true,
      })

      const testAtom = createAtom({
        defaultValue,
        effects: [order],
      })

      expect(actionOrder).toEqual([])
      await testAtom.didInit
      expect(actionOrder).toEqual(["init", "didInit"])
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
