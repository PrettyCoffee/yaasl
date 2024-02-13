export const isPromise = (value: unknown): value is Promise<any> =>
  value instanceof Promise
