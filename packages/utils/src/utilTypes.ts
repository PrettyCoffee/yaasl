export type Prettify<T> = {
  [K in keyof T]: T[K]
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {}

export type Dispatch<T> = (value: T) => void

export type SetStateAction<State> = State | ((prevState: State) => State)
