import { isPromiseLike } from "./isPromiseLike"

type Executor<T, R> = ((value: T) => R | PromiseLike<R>) | undefined | null

export class Thenable<T = undefined> implements PromiseLike<T> {
  constructor(private value?: T) {}
  then<Result = T, Reject = never>(
    onfulfilled?: Executor<T, Result>,
    onrejected?: Executor<any, Reject>
  ): PromiseLike<Result | Reject> {
    try {
      const result = !onfulfilled ? this.value : onfulfilled(this.value as T)
      return isPromiseLike(result) ? result : new Thenable(result as Result)
    } catch (error) {
      if (!onrejected) throw error
      const result = onrejected(error)
      return isPromiseLike(result) ? result : new Thenable(result)
    }
  }
}
