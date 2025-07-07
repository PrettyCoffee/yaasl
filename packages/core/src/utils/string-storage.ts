import { consoleMessage, log } from "@yaasl/utils"

interface StringStore {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

const createMemoryStore = (): StringStore => {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => (store[key] = value),
    removeItem: (key: string) => delete store[key],
  }
}

export interface StringStorageParser<T = any> {
  parse: (value: string) => T
  stringify: (value: T) => string
}

export interface StringStorageConstructorOptions<T> {
  key: string
  store?: StringStore
  parser?: StringStorageParser<T>
}

export class StringStorage<T = unknown> {
  private readonly key: string
  private readonly store: StringStore
  private readonly parser: StringStorageParser<T>

  constructor({
    key,
    store = createMemoryStore(),
    parser = JSON,
  }: StringStorageConstructorOptions<T>) {
    this.key = key
    this.store = store
    this.parser = parser
  }

  public get(): T | null {
    const value = this.store.getItem(this.key)
    try {
      return typeof value !== "string" ? null : this.parser.parse(value)
    } catch {
      throw new Error(
        consoleMessage(
          `Value of local storage key "${this.key}" could not be parsed.`
        )
      )
    }
  }

  public set(value: T) {
    try {
      if (value === null) {
        this.store.removeItem(this.key)
      } else {
        this.store.setItem(this.key, this.parser.stringify(value))
      }
    } catch {
      log.error(
        `Value of atom with local storage key "${this.key}" could not be set.`,
        { value }
      )
    }
  }

  public remove() {
    this.store.removeItem(this.key)
  }
}
