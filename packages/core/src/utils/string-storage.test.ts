import { vi, it, describe, expect, beforeEach } from "vitest"

import { StringStorage } from "./string-storage"

const key = "test-key"
const value = { foo: "bar" }

describe("Test LocalStorage", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it("gets null if the key does not exist", () => {
    const storage = new StringStorage({ key, store: localStorage })
    expect(storage.get()).toBeNull()
  })

  it("gets a parsed value", () => {
    localStorage.setItem(key, JSON.stringify(value))
    const storage = new StringStorage({ key, store: localStorage })
    expect(storage.get()).toEqual(value)
  })

  it("throws an error if value cannot be parsed", () => {
    localStorage.setItem(key, "invalid-json")
    const storage = new StringStorage({ key, store: localStorage })
    expect(() => storage.get()).toThrowError()
  })

  it("sets a value", () => {
    const storage = new StringStorage({ key, store: localStorage })
    storage.set(value)
    expect(localStorage.getItem(key)).toBe(JSON.stringify(value))
  })

  it("removes a key", () => {
    localStorage.setItem(key, JSON.stringify(value))
    const storage = new StringStorage({ key, store: localStorage })
    storage.remove()
    expect(localStorage.getItem(key)).toBeNull()
  })

  describe("uses the parser", () => {
    const parser = {
      parse: vi.fn().mockReturnValue(value),
      stringify: vi.fn().mockReturnValue(JSON.stringify(value)),
    }

    it("stringify function when setting a value", () => {
      const storage = new StringStorage({ key, store: localStorage, parser })
      storage.set(value)
      expect(parser.stringify).toHaveBeenCalledWith(value)
    })

    it("parse function when getting a value", () => {
      localStorage.setItem(key, JSON.stringify(value))
      const storage = new StringStorage({ key, store: localStorage, parser })
      expect(storage.get()).toEqual(value)
      expect(parser.parse).toHaveBeenCalledWith(JSON.stringify(value))
    })
  })

  describe("handleTabSync", () => {
    it("should add event listener if onTabSync is passed", () => {
      const addEventListener = vi.fn()
      vi.spyOn(window, "addEventListener").mockImplementation(addEventListener)

      new StringStorage({ key, store: localStorage, onTabSync: vi.fn() })

      expect(addEventListener).toHaveBeenCalledWith(
        "storage",
        expect.any(Function)
      )
    })

    it("should not add event listener if onTabSync is not passed", () => {
      const addEventListener = vi.fn()
      vi.spyOn(window, "addEventListener").mockImplementation(addEventListener)

      new StringStorage({ key, store: localStorage })

      expect(addEventListener).not.toHaveBeenCalled()
    })
  })
})
