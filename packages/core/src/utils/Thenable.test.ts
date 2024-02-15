/* eslint-disable @typescript-eslint/no-unsafe-return -- doesn't matter for testing */
import { Thenable } from "./Thenable"

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe("Test Thenable", () => {
  it("Creates a Thenable", () => {
    const thenable = new Thenable("test")
    expect(thenable).toHaveProperty("then")
  })

  it("Can be awaited", async () => {
    const thenable = new Thenable("test")
    expect(await thenable).toMatch("test")
  })

  it("Can be awaited after calling .then", async () => {
    const thenable = new Thenable(0).then(value => value + 1)
    expect(await thenable).toBe(1)
  })

  describe(".then method", () => {
    it("returns a Thenable", () => {
      const testFn = jest.fn()
      const result = new Thenable("test").then(testFn)
      expect(result).toBeInstanceOf(Thenable)
      expect(testFn).toHaveBeenCalledWith("test")
    })

    it("returns a Promise", async () => {
      const testFn = jest.fn()
      const result = new Thenable("test").then(value =>
        sleep(5).then(() => testFn(value))
      )
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(testFn).toHaveBeenCalledWith("test")
    })

    it("is chainable with sync calls", async () => {
      const result = new Thenable(0)
        .then(value => value + 1)
        .then(value => value + 1)

      expect(result).not.toBeInstanceOf(Promise)
      expect(await result).toBe(2)
    })

    it("is chainable with async calls", async () => {
      const result = new Thenable(0)
        .then(value => sleep(5).then(() => value + 1))
        .then(value => sleep(5).then(() => value + 1))

      expect(result).toBeInstanceOf(Promise)
      expect(await result).toBe(2)
    })

    it("is chainable with sync and async mix", async () => {
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
  })

  describe("unwraps", () => {
    it("unwraps nested Thenables", async () => {
      const result = new Thenable(1).then(value => new Thenable(value + 1))
      expect(result).toBeInstanceOf(Thenable)
      expect(await result).toBe(2)
    })

    it("unwraps nested Promises", async () => {
      const result = new Thenable(1).then(value => Promise.resolve(value + 1))
      expect(result).toBeInstanceOf(Promise)
      expect(await result).toBe(2)
    })

    it("unwraps deep shit", async () => {
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

  describe(".isThenable method", () => {
    it.each`
      name          | value                 | result
      ${"Thenable"} | ${new Thenable(0)}    | ${true}
      ${"Promise"}  | ${Promise.resolve(0)} | ${false}
      ${"number"}   | ${0}                  | ${false}
    `("$name will result in $result", ({ value, result }) => {
      expect(Thenable.isThenable(value)).toBe(result)
    })
  })

  describe(".all method", () => {
    it("combines thenables", async () => {
      const result = Thenable.all([new Thenable(1), new Thenable(2)])
      expect(result).toBeInstanceOf(Thenable)
      expect(await result).toEqual([1, 2])
    })

    it("combines promises", async () => {
      const result = Thenable.all([
        sleep(1).then(() => 1),
        sleep(3).then(() => 2),
      ])
      expect(result).toBeInstanceOf(Promise)
      expect(await result).toEqual([1, 2])
    })

    it("combines thenables and promises", async () => {
      const result = Thenable.all([
        new Thenable(1),
        sleep(1).then(() => 2),
        new Thenable(3),
      ])
      expect(result).toBeInstanceOf(Promise)
      expect(await result).toEqual([1, 2, 3])
    })
  })
})
