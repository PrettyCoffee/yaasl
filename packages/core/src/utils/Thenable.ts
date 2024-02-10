const isPromiselike = (value: unknown): value is PromiseLike<any> =>
  typeof value === "object" &&
  value !== null &&
  "then" in value &&
  typeof value.then === "function"

type Executor<T, R> = ((value: T) => R | PromiseLike<R>) | undefined | null

export class Thenable<T = undefined> implements PromiseLike<T> {
  constructor(private value?: T) {}
  then<Result = T, Reject = never>(
    onfulfilled?: Executor<T, Result>,
    onrejected?: Executor<any, Reject>
  ): PromiseLike<Result | Reject> {
    try {
      const result = !onfulfilled ? this.value : onfulfilled(this.value as T)
      return isPromiselike(result) ? result : new Thenable(result as Result)
    } catch (error) {
      if (!onrejected) throw error
      const result = onrejected(error)
      return isPromiselike(result) ? result : new Thenable(result)
    }
  }
}
