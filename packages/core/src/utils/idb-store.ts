import { getWindow } from "@yaasl/utils"

const promisifyRequest = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

export class IdbStore<T = unknown> {
  private database?: Promise<IDBDatabase>

  constructor(private name: string) {
    const openRequest = getWindow()?.indexedDB.open(`${name}-database`)
    if (!openRequest) return
    this.database = promisifyRequest(openRequest)

    openRequest.onupgradeneeded = () => {
      const database = openRequest.result
      const exists = database.objectStoreNames.contains(name)

      if (!exists) {
        database.createObjectStore(name)
      }
    }
  }

  private async getStore(mode: IDBTransactionMode) {
    const database = await this.database
    return database?.transaction(this.name, mode).objectStore(this.name)
  }

  public getAllKeys() {
    return this.getStore("readonly").then(store =>
      !store
        ? []
        : promisifyRequest(store.getAllKeys()).then(keys => keys.map(String))
    )
  }

  public async get(key: string): Promise<T | undefined> {
    return this.getStore("readonly").then(store =>
      !store ? undefined : promisifyRequest<T>(store.get(key) as IDBRequest<T>)
    )
  }

  public set(key: string, value: T) {
    return this.getStore("readwrite").then(async store =>
      !store ? undefined : promisifyRequest(store.put(value, key))
    )
  }

  public delete(key: string) {
    return this.getStore("readwrite").then(store =>
      !store ? undefined : promisifyRequest(store.delete(key))
    )
  }
}
