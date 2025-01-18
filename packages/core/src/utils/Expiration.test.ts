import { vi, it, describe, expect, beforeAll, afterAll } from "vitest"

import { Expiration } from "./Expiration"

const key = "test-key"

const createDateIn = (ms: number) => {
  const date = new Date()
  date.setMilliseconds(date.getMilliseconds() + ms)
  return date
}

describe("Test Expiration", () => {
  beforeAll(() => {
    vi.useFakeTimers()
  })
  afterAll(() => {
    vi.useRealTimers
  })

  it("Loads existing expiration", () => {
    localStorage.setItem(key, createDateIn(100).valueOf().toString())
    const expiration = new Expiration({ key, expiresAt: createDateIn(300) })
    const onExpire = vi.fn()

    expiration.init(onExpire)
    expect(onExpire).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(onExpire).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(key)).toBeNull()

    vi.advanceTimersByTime(300)
    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  it("Resets if existing expiration is faulty", () => {
    localStorage.setItem(key, "this-is-not-a-date")
    const expiration = new Expiration({ key, expiresAt: createDateIn(300) })
    const onExpire = vi.fn()

    expiration.init(onExpire)

    expect(onExpire).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(key)).toBeNull()

    vi.advanceTimersByTime(300)
    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  it("Sets an expiration Date", () => {
    const expiration = new Expiration({ key, expiresAt: createDateIn(300) })
    const onExpire = vi.fn()

    expiration.set(onExpire)

    expect(localStorage.getItem(key)).toBe(String(Date.now() + 300))
    expect(onExpire).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(onExpire).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(key)).toBeNull()
  })

  it("Sets an expiration timeout", () => {
    const expiration = new Expiration({ key, expiresIn: 300 })
    const onExpire = vi.fn()

    expiration.set(onExpire)

    expect(localStorage.getItem(key)).toBe(String(Date.now() + 300))
    expect(onExpire).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(onExpire).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(key)).toBeNull()
  })

  it("Stops an expiration if was removed", () => {
    const expiration = new Expiration({ key, expiresIn: 300 })
    const onExpire = vi.fn()

    expiration.set(onExpire)
    localStorage.removeItem(key)
    expiration.init(onExpire)

    vi.advanceTimersByTime(300)
    expect(onExpire).not.toHaveBeenCalled()
  })
})
