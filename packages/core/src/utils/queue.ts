import { Thenable } from "@yaasl/utils"

type Task<Value> = (prev: Value) => PromiseLike<Value> | Value

export class Queue<T = void> {
  private last: PromiseLike<T> | null = null
  private queue: Task<T>[] = []

  public push(...tasks: Task<T>[]) {
    this.queue.push(...tasks)
    return this
  }

  public run(prev: T): PromiseLike<T> {
    const init = this.last ? this.last.then(() => prev) : new Thenable(prev)
    const result = this.queue.reduce<PromiseLike<T>>(
      (result, next) => result.then(prev => next(prev)),
      init
    )

    this.queue = []
    this.last = result

    result.then(value => {
      if (this.last === result) {
        this.last = null
      }
      return value
    })

    return result
  }
}
