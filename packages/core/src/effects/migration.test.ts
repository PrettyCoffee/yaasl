import { vi, it, describe, expect, beforeEach } from "vitest"

import { localStorage } from "./local-storage"
import { createMigrationStep, migration } from "./migration"
import { createAtom } from "../base"

const mockConsole = () => {
  const oldConsole = global.console
  const error = vi.fn<unknown[], unknown>()
  const warn = vi.fn<unknown[], unknown>()

  global.console = { ...global.console, error, warn }

  return { error, warn, resetConsole: () => (global.console = oldConsole) }
}

const migrateV1 = vi.fn()
const migrateV2 = vi.fn()

const v1 = createMigrationStep({
  previous: null,
  version: "v1",
  migrate: (data: number) => {
    migrateV1(data)
    return String(data)
  },
  validate: (data): data is number => typeof data === "number",
})

const v2 = createMigrationStep({
  previous: "v1",
  version: "v2",
  migrate: data => {
    migrateV2(data)
    return { value: data }
  },
})
const testName = "test-name"

describe("Test migration", () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  it("Sets latest version if none is present", () => {
    createAtom({
      name: testName,
      defaultValue: { value: "1" },
      effects: [localStorage(), migration({ steps: [v1, v2] })],
    })

    expect(migrateV1).not.toHaveBeenCalled()
    expect(migrateV2).not.toHaveBeenCalled()
    expect(window.localStorage.getItem(`${testName}-version`)).toBe(v2.version)
  })

  it("Migrates from missing version", () => {
    window.localStorage.setItem(testName, "0")
    const testAtom = createAtom({
      name: testName,
      defaultValue: { value: "1" },
      effects: [localStorage(), migration({ steps: [v1, v2] })],
    })

    expect(migrateV1).toHaveBeenCalledWith(0)
    expect(migrateV2).toHaveBeenCalledWith("0")
    expect(testAtom.get()).toEqual({ value: "0" })
    expect(window.localStorage.getItem(`${testName}-version`)).toBe(v2.version)
  })

  it("Migrates from a previous version", () => {
    window.localStorage.setItem(testName, '"0"')
    window.localStorage.setItem(`${testName}-version`, v1.version)
    const testAtom = createAtom({
      name: testName,
      defaultValue: { value: "1" },
      effects: [localStorage(), migration({ steps: [v1, v2] })],
    })

    expect(migrateV1).not.toHaveBeenCalled()
    expect(migrateV2).toHaveBeenCalledWith("0")
    expect(testAtom.get()).toEqual({ value: "0" })
    expect(window.localStorage.getItem(`${testName}-version`)).toBe(v2.version)
  })

  it("Stops when an error is thrown", () => {
    const { error, resetConsole } = mockConsole()

    window.localStorage.setItem(testName, "0")
    const throwingV2 = createMigrationStep({
      previous: "v1",
      version: "v2",
      migrate: () => {
        throw new Error("test-error")
      },
    })
    const testAtom = createAtom({
      name: testName,
      defaultValue: { value: "1" },
      effects: [localStorage(), migration({ steps: [v1, throwingV2] })],
    })
    expect(testAtom.get()).toBe(0)
    expect(window.localStorage.getItem(`${testName}-version`)).toBe(null)
    expect(error).toHaveBeenCalledTimes(1)

    resetConsole()
  })

  it("Stops when the data is invalid", () => {
    const { error, resetConsole } = mockConsole()

    window.localStorage.setItem(testName, '"0"')
    const testAtom = createAtom({
      name: testName,
      defaultValue: { value: "1" },
      effects: [localStorage(), migration({ steps: [v1, v2] })],
    })

    expect(testAtom.get()).toEqual("0")
    expect(window.localStorage.getItem(`${testName}-version`)).toBe(null)
    expect(error).toHaveBeenCalledTimes(1)

    resetConsole()
  })
})
