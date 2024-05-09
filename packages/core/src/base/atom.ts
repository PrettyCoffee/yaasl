import { SetStateAction } from "@yaasl/utils"

import { Stateful } from "./Stateful"
import { MiddlewareAtomCallback } from "../middleware/middleware"
import { MiddlewareDispatcher } from "../middleware/MiddlewareDispatcher"

export interface AtomConfig<Value> {
  /** Value that will be returned if the atom is not defined in the store */
  defaultValue: Value
  /** Name of the atom. Must be unique among all atoms. */
  name?: string
  /** Middleware that will be applied on the atom */
  middleware?: MiddlewareAtomCallback<any>[]
}

let key = 0

export class Atom<Value = unknown> extends Stateful<Value> {
  public readonly defaultValue: Value
  public readonly name: string
  public didInit: PromiseLike<void> | boolean = false

  constructor({
    defaultValue,
    name = `atom-${++key}`,
    middleware,
  }: AtomConfig<Value>) {
    super(defaultValue)
    this.name = name
    this.defaultValue = defaultValue

    if (!middleware || middleware.length === 0) {
      this.didInit = true
      return
    }
    const { didInit } = new MiddlewareDispatcher({ atom: this, middleware })
    if (typeof didInit === "boolean") {
      this.didInit = didInit
    } else {
      this.didInit = didInit.then(() => {
        this.didInit = true
      })
    }
  }

  /** Set the value of the atom.
   *
   * @param next New value or function to create the
   * new value based off the previous value.
   */
  public set(next: SetStateAction<Value>) {
    const value = next instanceof Function ? next(this.get()) : next
    super.update(value)
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
export const atom = <Value>(config: AtomConfig<Value>) => new Atom(config)
