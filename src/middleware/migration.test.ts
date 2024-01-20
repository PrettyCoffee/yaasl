import { localStorage } from "./localStorage"
import { createMigrationStep, migration } from "./migration"
import { atom } from "../core"
import { mockConsole } from "../utils/mockConsole"

const migrateV1 = jest.fn()
const migrateV2 = jest.fn()

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
    jest.clearAllMocks()
  })

  it("Sets latest version if none is present", () => {
    atom({
      name: testName,
      defaultValue: { value: "1" },
      middleware: [localStorage(), migration({ steps: [v1, v2] })],
    })

    expect(migrateV1).not.toHaveBeenCalled()
    expect(migrateV2).not.toHaveBeenCalled()
    expect(window.localStorage.getItem(`${testName}-version`)).toBe(v2.version)
  })

  it("Migrates from missing version", () => {
    window.localStorage.setItem(testName, "0")
    const testAtom = atom({
      name: testName,
      defaultValue: { value: "1" },
      middleware: [localStorage(), migration({ steps: [v1, v2] })],
    })

    expect(migrateV1).toHaveBeenCalledWith(0)
    expect(migrateV2).toHaveBeenCalledWith("0")
    expect(testAtom.get()).toEqual({ value: "0" })
    expect(window.localStorage.getItem(`${testName}-version`)).toBe(v2.version)
  })

  it("Migrates from a previous version", () => {
    window.localStorage.setItem(testName, '"0"')
    window.localStorage.setItem(`${testName}-version`, v1.version)
    const testAtom = atom({
      name: testName,
      defaultValue: { value: "1" },
      middleware: [localStorage(), migration({ steps: [v1, v2] })],
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
    const testAtom = atom({
      name: testName,
      defaultValue: { value: "1" },
      middleware: [localStorage(), migration({ steps: [v1, throwingV2] })],
    })
    expect(testAtom.get()).toBe(0)
    expect(window.localStorage.getItem(`${testName}-version`)).toBe(null)
    expect(error).toHaveBeenCalledTimes(1)

    resetConsole()
  })

  it("Stops when the data is invalid", () => {
    const { error, resetConsole } = mockConsole()

    window.localStorage.setItem(testName, '"0"')
    const testAtom = atom({
      name: testName,
      defaultValue: { value: "1" },
      middleware: [localStorage(), migration({ steps: [v1, v2] })],
    })

    expect(testAtom.get()).toEqual("0")
    expect(window.localStorage.getItem(`${testName}-version`)).toBe(null)
    expect(error).toHaveBeenCalledTimes(1)

    resetConsole()
  })
})
