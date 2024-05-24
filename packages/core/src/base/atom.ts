import { SetStateAction } from "@yaasl/utils"

import { Actions, Reducers, createActions } from "./createActions"
import { Stateful } from "./Stateful"
import { MiddlewareAtomCallback } from "../middleware/middleware"
import { MiddlewareDispatcher } from "../middleware/MiddlewareDispatcher"

export interface AtomConfig<Value, R extends Reducers<Value> = {}> {
  /** Value that will be used initially. */
  defaultValue: Value
  /** Name of the atom. Must be unique among all atoms. Defaults to "atom-{number}". */
  name?: string
  /** Middleware that will be applied on the atom. */
  middleware?: MiddlewareAtomCallback<any>[]
  /** Reducers for custom actions to set the atoms value. */
  reducers?: R
}

let key = 0

export class Atom<
  Value = unknown,
  R extends Reducers<Value> = {}
> extends Stateful<Value> {
  public readonly defaultValue: Value
  public readonly name: string
  public readonly actions: Actions<Value, R>

  constructor({
    defaultValue,
    name = `atom-${++key}`,
    middleware,
    reducers = {} as R,
  }: AtomConfig<Value, R>) {
    super(defaultValue)
    this.name = name
    this.defaultValue = defaultValue
    this.actions = createActions(this, reducers)

    if (!middleware || middleware.length === 0) {
      this.didInit = true
      return
    }
    const { didInit } = new MiddlewareDispatcher({ atom: this, middleware })
    this.setDidInit(didInit)
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
 * @param config.reducers Reducers for custom actions to set the atoms value.
 *
 * @returns An atom instance.
 * - `result.get`: Read the value of state.
 * - `result.subscribe`: Subscribe to value changes.
 * - `result.set`: Set the value of the atom.
 * - `result.actions`: All actions that were created with reducers.
 * - `result.didInit`: State of the atom's middleware initialization process.
 *   Will be a promise if the initialization is pending and `true` if finished.
 **/
export const atom = <Value, R extends Reducers<Value>>(
  config: AtomConfig<Value, R>
) => new Atom(config)
