import { vi, it, describe, expect, beforeEach, afterEach } from "vitest"

import { expiration } from "./expiration"
import { localStorage } from "./local-storage"
import { createAtom } from "../base"

const defaultValue = { a: "A", b: "B" }
const nextValue = {
  c: "C",
  d: "D",
}
const name = "atom"
const storeKey = "atom-expires-at"

describe("Test expiration", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    window.localStorage.clear()
    vi.useRealTimers()
  })

  it("expires in given milliseconds", () => {
    const testAtom = createAtom<object>({
      defaultValue,
      name,
      effects: [expiration({ expiresIn: 300 })],
    })

    testAtom.set(nextValue)

    expect(testAtom.get()).toStrictEqual(nextValue)
    expect(window.localStorage.getItem(storeKey)).toBe(String(Date.now() + 300))

    vi.advanceTimersByTime(300)

    expect(testAtom.get()).toStrictEqual(defaultValue)
    expect(window.localStorage.getItem(storeKey)).toBeNull()
  })

  it("expires at a specific date", () => {
    const expirationDate = new Date(Date.now() + 300)
    const testAtom = createAtom<object>({
      defaultValue,
      name,
      effects: [expiration({ expiresAt: expirationDate })],
    })

    testAtom.set(nextValue)

    expect(testAtom.get()).toStrictEqual(nextValue)
    expect(window.localStorage.getItem(storeKey)).toBe(
      String(expirationDate.valueOf())
    )

    vi.advanceTimersByTime(300)

    expect(testAtom.get()).toStrictEqual(defaultValue)
    expect(window.localStorage.getItem(storeKey)).toBeNull()
  })

  it("loads an expisting expiration", () => {
    const existing = Date.now() + 150
    window.localStorage.setItem(storeKey, String(existing))
    window.localStorage.setItem(name, JSON.stringify(nextValue))
    const testAtom = createAtom<object>({
      defaultValue,
      name,
      effects: [expiration({ expiresIn: 300 }), localStorage({ key: name })],
    })

    expect(testAtom.get()).toStrictEqual(nextValue)
    expect(window.localStorage.getItem(storeKey)).toBe(String(existing))

    vi.advanceTimersByTime(150)

    expect(testAtom.get()).toStrictEqual(defaultValue)
    expect(window.localStorage.getItem(storeKey)).toBeNull()
  })
})
