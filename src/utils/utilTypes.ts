export type Prettify<T> = {
  [K in keyof T]: T[K]
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {}

export type UnknownObject = Record<string, unknown>

export type Fn<Args extends unknown[], Result> = (...args: Args) => Result

export type InferFnArg<FunctionType, BaseType> = FunctionType extends Fn<
  [infer Value],
  BaseType
>
  ? Value
  : BaseType

export type InferFnResult<FunctionType, BaseType> = FunctionType extends Fn<
  [BaseType],
  infer Value
>
  ? Value
  : BaseType

export type Dispatch<Action> = Fn<[Action], void>
