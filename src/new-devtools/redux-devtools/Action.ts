export interface Action<T extends string = string> {
  type: T
}

export type ActionCreator<A, P extends unknown[] = unknown[]> = (
  ...args: P
) => A
