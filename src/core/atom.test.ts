import { atom } from "./atom"
import { Middleware } from "../middleware"

const defaultValue = "default"

const testMiddleware: Middleware = {
  options: {},
  actions: { init: jest.fn() },
}

beforeEach(() => jest.resetAllMocks())

describe("Test atom", () => {
  it("Creates an atom with default value", () => {
    expect(atom({ defaultValue })).toHaveProperty("defaultValue", defaultValue)
  })

  it("Creates an atom with unique name", () => {
    expect(atom({ defaultValue }).toString()).toMatch(/atom-\d+/)
  })

  it("Creates an atom with custom name", () => {
    const name = "test"
    expect(atom({ defaultValue, name }).toString()).toBe(name)
  })

  it("Creates an atom with middleware", () => {
    expect(
      atom({ defaultValue, middleware: [() => testMiddleware] }).middleware
    ).toStrictEqual([testMiddleware])
  })
})
