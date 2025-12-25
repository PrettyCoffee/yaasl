import { deepCompare } from "./deep-compare"

const compareDeps = (a: unknown[], b: unknown[]) =>
  a.length === b.length && a.every((arg, index) => arg === b[index])

export const memoizeFunction = <TArgs extends unknown[], TResult>(
  resultFn: (...args: TArgs) => TResult,
  compareResult?: (before: TResult, after: TResult) => boolean
) => {
  let lastDeps = [resultFn, compareResult, ...([] as unknown as TArgs)]
  let lastResult = undefined as TResult

  const memo = Object.assign(
    (...args: TArgs) => {
      const newDeps = [memo.resultFn, memo.compareResult, ...args]
      if (compareDeps(lastDeps, newDeps)) {
        return lastResult
      } else {
        lastDeps = newDeps
      }

      const value = memo.resultFn(...args)
      if ((memo.compareResult ?? deepCompare)(lastResult, value)) {
        return lastResult
      } else {
        lastResult = value
        return value
      }
    },
    {
      resultFn,
      compareResult,
    }
  )

  return memo
}
