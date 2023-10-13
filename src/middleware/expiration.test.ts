import { expiration } from "./expiration"
import { localStorage } from "./localStorage"
import { atom } from "../core"

const defaultValue = { a: "A", b: "B" }
const nextValue = {
  c: "C",
  d: "D",
}
const name = "atom"
const storeKey = "atom-expires-at"

describe("Test expiration", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    window.localStorage.clear()
    jest.useRealTimers()
  })

  it("expires in given milliseconds", () => {
    const testAtom = atom<object>({
      defaultValue,
      name,
      middleware: [expiration({ expiresIn: 300 })],
    })

    testAtom.set(nextValue)

    expect(testAtom.get()).toStrictEqual(nextValue)
    expect(window.localStorage.getItem(storeKey)).toBe(String(Date.now() + 300))

    jest.advanceTimersByTime(300)

    expect(testAtom.get()).toStrictEqual(defaultValue)
    expect(window.localStorage.getItem(storeKey)).toBeNull()
  })

  it("expires at a specific date", () => {
    const expirationDate = new Date(Date.now() + 300)
    const testAtom = atom<object>({
      defaultValue,
      name,
      middleware: [expiration({ expiresAt: expirationDate })],
    })

    testAtom.set(nextValue)

    expect(testAtom.get()).toStrictEqual(nextValue)
    expect(window.localStorage.getItem(storeKey)).toBe(
      String(expirationDate.valueOf())
    )

    jest.advanceTimersByTime(300)

    expect(testAtom.get()).toStrictEqual(defaultValue)
    expect(window.localStorage.getItem(storeKey)).toBeNull()
  })

  it("loads an expisting expiration", () => {
    const existing = Date.now() + 150
    window.localStorage.setItem(storeKey, String(existing))
    window.localStorage.setItem(name, JSON.stringify(nextValue))
    const testAtom = atom<object>({
      defaultValue,
      name,
      middleware: [expiration({ expiresIn: 300 }), localStorage({ key: name })],
    })

    expect(testAtom.get()).toStrictEqual(nextValue)
    expect(window.localStorage.getItem(storeKey)).toBe(String(existing))

    jest.advanceTimersByTime(150)

    expect(testAtom.get()).toStrictEqual(defaultValue)
    expect(window.localStorage.getItem(storeKey)).toBeNull()
  })
})
