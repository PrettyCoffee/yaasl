import { Thenable, isPromiseLike, sleep } from "@yaasl/utils"
import { vi, it, describe, expect, afterEach } from "vitest"

import { Queue } from "./queue"

const plus1 = vi.fn((prev: string) => prev + "1")
const plus2 = vi.fn((prev: string) => prev + "2")

const asyncPlus3 = vi.fn(async (prev: string) => {
  await sleep(5)
  return prev + "3"
})
const asyncPlus4 = vi.fn(async (prev: string) => {
  await sleep(5)
  return prev + "4"
})

describe("Test Queue", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("Runs a task", async () => {
    const queue = new Queue<string>()
    const promise = queue.push(plus1).run("i")

    expect(isPromiseLike(promise)).toBeTruthy()
    expect(await promise).toBe("i1")
    expect(plus1).toHaveBeenCalledWith("i")
    expect(plus1).toHaveBeenCalledTimes(1)
  })

  it("Runs multiple tasks", async () => {
    const queue = new Queue<string>()
    const promise = queue.push(plus1, plus2).run("i")

    expect(isPromiseLike(promise)).toBeTruthy()
    expect(await promise).toBe("i12")

    expect(plus1).toHaveBeenCalledWith("i")
    expect(plus1).toHaveBeenCalledTimes(1)

    expect(plus2).toHaveBeenCalledWith("i1")
    expect(plus2).toHaveBeenCalledTimes(1)
  })

  it("allows to push tasks multiple times", async () => {
    const queue = new Queue<string>()
    queue.push(plus1)
    queue.push(plus2)
    const promise = queue.run("i")

    expect(isPromiseLike(promise)).toBeTruthy()
    expect(await promise).toBe("i12")

    expect(plus1).toHaveBeenCalledWith("i")
    expect(plus1).toHaveBeenCalledTimes(1)

    expect(plus2).toHaveBeenCalledWith("i1")
    expect(plus2).toHaveBeenCalledTimes(1)
  })

  it("Returns a Thenable with synchronous tasks", async () => {
    const queue = new Queue<string>()
    const promise = queue.push(plus1, plus2).run("i")

    expect(promise).toBeInstanceOf(Thenable)
    expect(await promise).toBe("i12")
  })

  it("Returns a Promise with synchronous tasks", async () => {
    const queue = new Queue<string>()
    const promise = queue.push(asyncPlus3, asyncPlus4).run("i")

    expect(promise).toBeInstanceOf(Promise)
    expect(await promise).toBe("i34")
  })

  it("Returns a Promise with mixed sync and async tasks", async () => {
    const queue = new Queue<string>()
    const promise = queue.push(asyncPlus3, plus1, asyncPlus4, plus2).run("i")

    expect(promise).toBeInstanceOf(Promise)
    expect(await promise).toBe("i3142")

    expect(asyncPlus3).toHaveBeenCalledWith("i")
    expect(plus1).toHaveBeenCalledWith("i3")
    expect(asyncPlus4).toHaveBeenCalledWith("i31")
    expect(plus2).toHaveBeenCalledWith("i314")
  })
})
