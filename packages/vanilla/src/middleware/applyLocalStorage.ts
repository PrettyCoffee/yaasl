import { applyMiddleware } from "./applyMiddleware"
import { AnyAtom, AtomTypesLookup, InferAtom } from "../utils/atomTypes"
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

export const applyLocalStorage = <
  ParentAtom extends AnyAtom<
    AtomTypes["value"],
    AtomTypes["getResult"],
    AtomTypes["setArg"],
    AtomTypes["extension"]
  >,
  AtomTypes extends AtomTypesLookup = InferAtom<ParentAtom>
>(
  atom: ParentAtom,
  key: string
) => {
  if (getStorageValue(key) === null) setStorageValue(key, atom.get())

  return applyMiddleware(atom, {
    onSet: value => {
      STORAGE.setItem(key, JSON.stringify(value))
      return value
    },
    extension: {
      remove: () => STORAGE.removeItem(key),
      reset: () => {
        setStorageValue(key, atom.initialValue)
        atom.set(atom.initialValue)
      },
    },
  })
}
