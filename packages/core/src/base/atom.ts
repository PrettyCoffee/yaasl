import { SetStateAction } from "@yaasl/utils"

import { Stateful } from "./Stateful"
import { MiddlewareAtomCallback } from "../middleware/middleware"
import { MiddlewareDispatcher } from "../middleware/MiddlewareDispatcher"

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

  constructor({
    defaultValue,
    name = `atom-${++key}`,
    middleware,
  }: AtomConfig<AtomValue>) {
    super(defaultValue)
    this.name = name
    this.defaultValue = defaultValue

    if (!middleware || middleware.length === 0) {
      return
    }
    new MiddlewareDispatcher({ atom: this, middleware })
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

  /** Resolve the value of a promise and set as atom value.
   *
   * @param promise Promise to unwrap
   */
  public async unwrap(promise: Promise<AtomValue>) {
    const value = await promise
    this.set(value)
    return value
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
