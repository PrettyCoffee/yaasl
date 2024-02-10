const promisifyRequest = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

export class Store<T> {
  private database: Promise<IDBDatabase>

  constructor(private name: string) {
    const openRequest = indexedDB.open(`${name}-database`)
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
    return database.transaction(this.name, mode).objectStore(this.name)
  }

  public async get(key: string): Promise<T | undefined> {
    return this.getStore("readonly").then(store =>
      promisifyRequest<T>(store.get(key) as IDBRequest<T>)
    )
  }

  public set(key: string, value: T) {
    return this.getStore("readwrite").then(async store => {
      await promisifyRequest(store.put(value, key))
    })
  }

  public delete(key: string) {
    return this.getStore("readwrite").then(store =>
      promisifyRequest(store.delete(key))
    )
  }
}
