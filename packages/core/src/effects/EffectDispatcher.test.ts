import { sleep } from "@yaasl/utils"

import { effect } from "./effect"
import { EffectDispatcher } from "./EffectDispatcher"
import { createAtom } from "../base"

interface TestOptions {
  types: {
    initType: "sync" | "async"
    didInitType: "sync" | "async"
  }
  labels: [string, string, string]
  onEmit: (value: string) => void
  wait?: number
}
const createEffect = ({
  onEmit,
  types: { initType, didInitType },
  labels: [init, didInit, set],
  wait = 10,
}: TestOptions) =>
  effect({
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

describe("Test EffectDispatcher", () => {
  describe.each`
    initType   | didInitType
    ${"sync"}  | ${"sync"}
    ${"sync"}  | ${"async"}
    ${"async"} | ${"sync"}
    ${"async"} | ${"async"}
  `(
    "{ init: $initType, didInit: $didInitType }",
    (types: TestOptions["types"]) => {
      const testFn = vi.fn()
      const e = createEffect({
        types: types,
        labels: ["init", "didInit", "set"],
        onEmit: testFn,
      })

      beforeEach(() => {
        testFn.mockClear()
      })

      it("sets the didInit status correctly", async () => {
        const testAtom = createAtom({ defaultValue: 0 })

        const dispatcher = new EffectDispatcher({
          atom: testAtom,
          effects: [e()],
        })

        if (types.initType === "async" || types.didInitType === "async") {
          expect(dispatcher.didInit).toBeInstanceOf(Promise)
          await dispatcher.didInit
        }
        expect(dispatcher.didInit).toBe(true)
      })

      it("calls init and didInit", async () => {
        const testAtom = createAtom({ defaultValue: 0 })

        const dispatcher = new EffectDispatcher({
          atom: testAtom,
          effects: [e()],
        })

        await dispatcher.didInit
        expect(testFn.mock.calls.flat()).toStrictEqual(["init", "didInit"])
      })
    }
  )

  it("waits for all tasks to finish", async () => {
    const testFn = vi.fn()
    const testAtom = createAtom({ defaultValue: 0 })
    const e1 = createEffect({
      types: { initType: "async", didInitType: "async" },
      labels: ["init1", "didInit1", "set1"],
      onEmit: testFn,
      wait: 5,
    })
    const e2 = createEffect({
      types: { initType: "async", didInitType: "async" },
      labels: ["init2", "didInit2", "set2"],
      onEmit: testFn,
      wait: 1,
    })

    const dispatcher = new EffectDispatcher({
      atom: testAtom,
      effects: [e1(), e2()],
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
