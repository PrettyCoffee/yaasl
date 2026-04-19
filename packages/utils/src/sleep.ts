export const sleep = (ms: number) =>
  new Promise(resolve => globalThis.setTimeout(resolve, ms))
