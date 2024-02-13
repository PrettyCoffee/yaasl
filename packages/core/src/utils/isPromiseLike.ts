export const isPromiseLike = (value: unknown): value is PromiseLike<any> =>
  typeof value === "object" &&
  value !== null &&
  "then" in value &&
  typeof value.then === "function"
