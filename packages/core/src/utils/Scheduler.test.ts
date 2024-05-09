import { sleep, Thenable } from "@yaasl/utils"

import { Scheduler } from "./Scheduler"

const execOrder = () => {
  const calls: string[] = []
  const resolved: string[] = []

  const task = () => {
    calls.push("task")
    resolved.push("task")
  }
  const thenable = () => {
    calls.push("thenable")
    return new Thenable().then(() => {
      resolved.push("thenable")
    })
  }
  const promise = () => {
    calls.push("promise")
    return sleep(5).then(() => {
      resolved.push("promise")
    })
  }

  return { resolved, calls, promise, thenable, task }
}

describe("Test Scheduler", () => {
  it("Runs non promise like tasks", () => {
    const { resolved, task } = execOrder()
    const scheduler = new Scheduler()
    const result = scheduler.run([task, task, task])
    expect(result).toBeInstanceOf(Thenable)
    expect(resolved).toEqual(["task", "task", "task"])
  })

  it("Runs thenable tasks", () => {
    const { resolved, thenable } = execOrder()
    const scheduler = new Scheduler()
    const result = scheduler.run([thenable, thenable, thenable])
    expect(result).toBeInstanceOf(Thenable)
    expect(resolved).toEqual(["thenable", "thenable", "thenable"])
  })

  it("Runs promise tasks", async () => {
    const { resolved, promise } = execOrder()
    const scheduler = new Scheduler()
    const result = scheduler.run([promise, promise, promise])
    expect(result).toBeInstanceOf(Promise)
    await result
    expect(resolved).toEqual(["promise", "promise", "promise"])
  })

  it("Runs mixed tasks", async () => {
    const { resolved, task, thenable, promise } = execOrder()
    const scheduler = new Scheduler()
    const result = scheduler.run([task, promise, thenable, promise, task])
    expect(result).toBeInstanceOf(Promise)
    await result
    expect(resolved).toEqual(["task", "thenable", "task", "promise", "promise"])
  })

  it("Waits for existing queue to finish", async () => {
    const { resolved, calls, promise, thenable } = execOrder()
    const scheduler = new Scheduler()

    const first = scheduler.run([promise, thenable])
    const second = scheduler.run([promise, thenable])
    const third = scheduler.run([promise, thenable])

    expect(calls).toEqual(["promise", "thenable"])

    await first
    expect(calls).toEqual(["promise", "thenable", "promise", "thenable"])
    expect(resolved).toEqual([
      "thenable",
      "promise",
      "thenable" /* this thenable will be resolved right away */,
    ])

    await second
    expect(resolved).toEqual([
      "thenable",
      "promise",
      "thenable",
      "promise",
      "thenable" /* this thenable will be resolved right away */,
    ])
    expect(calls).toEqual([
      "promise",
      "thenable",
      "promise",
      "thenable",
      "promise",
      "thenable",
    ])

    await third
    expect(resolved).toEqual([
      "thenable",
      "promise",
      "thenable",
      "promise",
      "thenable",
      "promise",
    ])
  })
})
