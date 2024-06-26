export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type Dispatch<T> = (value: T) => void
