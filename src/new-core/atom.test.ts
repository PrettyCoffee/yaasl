import { atom } from "./atom"

const defaultValue = "default"

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
})
