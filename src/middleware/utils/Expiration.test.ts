import { Expiration } from "./Expiration"

const key = "test-key"

const createDateIn = (ms: number) => {
  const date = new Date()
  date.setMilliseconds(date.getMilliseconds() + ms)
  return date
}

describe("Test Expiration", () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })
  afterAll(() => {
    jest.useRealTimers
  })

  it("Loads existing expiration", () => {
    localStorage.setItem(key, createDateIn(100).valueOf().toString())
    const expiration = new Expiration({ key, expiresAt: createDateIn(300) })
    const onExpire = jest.fn()

    expiration.init(onExpire)
    expect(onExpire).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)
    expect(onExpire).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(key)).toBeNull()

    jest.advanceTimersByTime(300)
    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  it("Resets if existing expiration is faulty", () => {
    localStorage.setItem(key, "this-is-not-a-date")
    const expiration = new Expiration({ key, expiresAt: createDateIn(300) })
    const onExpire = jest.fn()

    expiration.init(onExpire)

    expect(onExpire).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(key)).toBeNull()

    jest.advanceTimersByTime(300)
    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  it("Sets and expiration Date", () => {
    const expiration = new Expiration({ key, expiresAt: createDateIn(300) })
    const onExpire = jest.fn()

    expiration.set(onExpire)

    expect(localStorage.getItem(key)).toBe(String(Date.now() + 300))
    expect(onExpire).not.toHaveBeenCalled()

    jest.advanceTimersByTime(300)
    expect(onExpire).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(key)).toBeNull()
  })

  it("Sets and expiration timeout", () => {
    const expiration = new Expiration({ key, expiresIn: 300 })
    const onExpire = jest.fn()

    expiration.set(onExpire)

    expect(localStorage.getItem(key)).toBe(String(Date.now() + 300))
    expect(onExpire).not.toHaveBeenCalled()

    jest.advanceTimersByTime(300)
    expect(onExpire).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(key)).toBeNull()
  })
})
