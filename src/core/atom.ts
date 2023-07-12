import { Stateful } from "./Stateful"
import { MiddlewareAtomCallback, Middleware } from "../middleware/middleware"
import { SetStateAction } from "../utils/utilTypes"

interface AtomConfig<AtomValue> {
  /** Value that will be returned if the atom is not defined in the store */
  defaultValue: AtomValue
  /** Name of the atom. Must be unique among all atoms. */
  name?: string
  /** Middleware that will be applied on the atom */
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
  }: AtomConfig<AtomValue>) {
    super(defaultValue)
    this.name = name
    this.defaultValue = defaultValue
    this.initMiddleware(middleware)
  }

  /** Set the value of the atom.
   *
   * @param next New value or function to create the
   * new value based off the previous value.
   */
  public set(next: SetStateAction<AtomValue>) {
    const value = next instanceof Function ? next(this.get()) : next
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

/** Creates an atom store.
 *
 * @param config.defaultValue Value that will be used initially.
 * @param config.name Name of the atom. Must be unique among all atoms. Defaults to "atom-{number}".
 * @param config.middleware Middleware that will be applied on the atom.
 *
 * @returns An atom instance.
 **/
export const atom = <AtomValue>(config: AtomConfig<AtomValue>) =>
  new Atom(config)
