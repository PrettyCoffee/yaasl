export const freeze = <T extends object>(object: T): Readonly<T> =>
  Object.freeze(object)
