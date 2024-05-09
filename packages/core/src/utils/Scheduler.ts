import { toVoid, isPromiseLike, Thenable } from "@yaasl/utils"

type Task = () => PromiseLike<unknown> | unknown

export class Scheduler {
  public queue: PromiseLike<void> | null = null

  public run(...tasks: Task[] | Task[][]): PromiseLike<void> {
    const run = () => this.execute(tasks.flat()).then(toVoid)

    const promise = this.queue ? this.queue.then(run) : run()
    this.queue = promise

    return promise.then(() => {
      if (this.queue !== promise) return
      this.queue = null
    })
  }

  private execute(tasks: Task[]) {
    const result = tasks.map(task => {
      const result = task()
      return isPromiseLike(result) ? result : new Thenable(result)
    })
    return Thenable.all(result)
  }
}
