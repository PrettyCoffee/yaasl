/* eslint-disable @typescript-eslint/no-unsafe-return -- doesn't matter for testing */
import { Thenable } from "./Thenable"

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe("Test Thenable", () => {
  it("Creates a Thenable", () => {
    const thenable = new Thenable("test")
    expect(thenable).toHaveProperty("then")
  })

  it(".then method returns a Thenable", () => {
    const testFn = jest.fn()
    const result = new Thenable("test").then(testFn)
    expect(result).toBeInstanceOf(Thenable)
    expect(testFn).toHaveBeenCalledWith("test")
  })

  it(".then method returns a Promise", async () => {
    const testFn = jest.fn()
    const result = new Thenable("test").then(value =>
      sleep(5).then(() => testFn(value))
    )
    expect(result).toBeInstanceOf(Promise)
    await result
    expect(testFn).toHaveBeenCalledWith("test")
  })

  it("Can be awaited", async () => {
    const thenable = new Thenable("test")
    expect(await thenable).toMatch("test")
  })

  it("Can be awaited after calling .then", async () => {
    const thenable = new Thenable(0).then(value => value + 1)
    expect(await thenable).toBe(1)
  })

  it("chains multiple sync .then calls", async () => {
    const result = new Thenable(0)
      .then(value => value + 1)
      .then(value => value + 1)

    expect(result).not.toBeInstanceOf(Promise)
    expect(await result).toBe(2)
  })

  it("chains multiple async .then calls", async () => {
    const result = new Thenable(0)
      .then(value => sleep(5).then(() => value + 1))
      .then(value => sleep(5).then(() => value + 1))

    expect(result).toBeInstanceOf(Promise)
    expect(await result).toBe(2)
  })

  it("chains sync and async .then calls", async () => {
    const syncEnd = new Thenable(0)
      .then(value => sleep(5).then(() => value + 1))
      .then(value => value + 1)

    expect(syncEnd).toBeInstanceOf(Promise)
    expect(await syncEnd).toBe(2)

    const asyncEnd = new Thenable(0)
      .then(value => value + 1)
      .then(value => sleep(5).then(() => value + 1))

    expect(asyncEnd).toBeInstanceOf(Promise)
    expect(await asyncEnd).toBe(2)
  })

  it("Unwraps nested Thenables", () => {
    const thenable = new Thenable("test")
    const result = new Thenable().then(() => thenable.then(() => thenable))
    expect(result).toBe(thenable)
  })

  it("Unwraps deep shit", async () => {
    const result = new Thenable(1).then(value =>
      Promise.resolve(value + 1).then(value =>
        new Thenable(value + 1).then(value =>
          Promise.resolve(value + 1).then(value => new Thenable(value + 1))
        )
      )
    )
    expect(result).toBeInstanceOf(Promise)
    expect(await result).toBe(5)
  })
})
