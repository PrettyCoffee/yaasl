import { middleware } from "./middleware"
import { consoleMessage, log } from "../utils/log"

const STORAGE = window.localStorage

const setStorageValue = <T>(key: string, value: T) => {
  try {
    STORAGE.setItem(key, JSON.stringify(value))
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
  key?: string
}

export const localStorage = middleware<Options>(
  ({ type, atom, store, options, value }) => {
    const key = `${store.toString()}/${options.key ?? atom.toString()}`
    const existing = getStorageValue(key)

    switch (type) {
      case "INIT":
        if (existing === null) setStorageValue(key, atom.defaultValue)
        else store.set(atom, existing)
        break
      case "SET":
        setStorageValue(key, value)
        break
      case "REMOVE":
        STORAGE.removeItem(key)
        break
    }
  }
)
