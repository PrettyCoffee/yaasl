import { createMiddleware } from "./createMiddleware"
import { consoleMessage, log } from "../utils/log"

const STORAGE = window.localStorage

const setStorageValue = <T>(key: string, value: T) => {
  try {
    const stringValue = JSON.stringify(value)
    STORAGE.setItem(key, stringValue)
  } catch {
    log.error(
      `Value of atom with local storage key "${key}" could not be set.`,
      {
        value,
      }
    )
  }
}

const getStorageValue = <T>(key: string) => {
  const value = STORAGE.getItem(key)
  try {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return typeof value !== "string" ? null : (JSON.parse(value) as T)
  } catch {
    throw new Error(
      consoleMessage(`Value of local storage key "${key}" could not be parsed.`)
    )
  }
}

interface Options {
  key: string
}

interface Extension {
  remove: () => void
  reset: () => void
}

export const applyLocalStorage = createMiddleware<Options, Extension>({
  onInit: ({ atom, options }) => {
    if (getStorageValue(options.key) === null)
      setStorageValue(options.key, atom.initialValue)
    atom.set(getStorageValue(options.key))
  },
  onSet: (value, { options }) => {
    STORAGE.setItem(options.key, JSON.stringify(value))
  },
  createExtension: ({ atom, options }) => ({
    remove: () => STORAGE.removeItem(options.key),
    reset: () => {
      setStorageValue(options.key, atom.initialValue)
      atom.set(atom.initialValue)
    },
  }),
})
