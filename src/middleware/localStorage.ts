import { middleware } from "./middleware"
import { Atom, CONFIG, Store } from "../core"
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

const getKey = (store: Store, atom: Atom) =>
  `${CONFIG.name}${store.toString()}/${atom.toString()}`

export const localStorage = middleware<Options | undefined>(
  ({ type, atom, store, options = {}, value }) => {
    const key = options.key ?? getKey(store, atom)
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
