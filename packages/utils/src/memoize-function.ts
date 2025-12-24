import { deepCompare } from "./deep-compare"

const compareArgs = (a: unknown[], b: unknown[]) =>
  a.length === b.length && a.every((arg, index) => arg === b[index])

export const memoizeFunction = <TArgs extends unknown[], TResult>(
  resultFn: (...args: TArgs) => TResult,
  compare: (before: TResult, after: TResult) => boolean = deepCompare
) => {
  let memoizedArgs = [] as unknown as TArgs
  let memoizedValue = undefined as TResult

  return (...args: TArgs) => {
    if (compareArgs(memoizedArgs, args)) {
      return memoizedValue
    }

    memoizedArgs = args
    const value = resultFn(...args)
    if (compare(memoizedValue, value)) {
      return memoizedValue
    }

    memoizedValue = value
    return value
  }
}
