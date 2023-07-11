import { Stateful } from "./Stateful"
import { MiddlewareAtomCallback, Middleware } from "../middleware/middleware"

type SetStateAction<ValueType> =
  | ((previous: ValueType) => ValueType)
  | ValueType

interface AtomOptions<AtomValue> {
  defaultValue: AtomValue
  name?: string
  middleware?: MiddlewareAtomCallback<any>[]
}

let key = 0

export class Atom<AtomValue = unknown> extends Stateful<AtomValue> {
  public readonly defaultValue: AtomValue
  public readonly name: string
  private middleware: Middleware[] = []

  constructor({
    defaultValue,
    name = `atom-${++key}`,
    middleware,
  }: AtomOptions<AtomValue>) {
    super(defaultValue)
    this.name = name
    this.defaultValue = defaultValue
    this.initMiddleware(middleware)
  }

  public set(next: SetStateAction<AtomValue>) {
    const value = next instanceof Function ? next(this.snapshot()) : next
    super.update(value)
  }

  private initMiddleware(middleware?: MiddlewareAtomCallback<unknown>[]) {
    if (middleware == null) return

    this.middleware = middleware.map(create => create(this as Atom<any>))

    super.subscribe(value =>
      this.middleware.forEach(({ actions, options }) =>
        actions.set?.({ value, atom: this as Atom<any>, options })
      )
    )
  }
}

export const atom = <AtomValue>(options: AtomOptions<AtomValue>) =>
  new Atom(options)
