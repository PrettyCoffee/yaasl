import { SetStateAction } from "@yaasl/utils"

import { Actions, Reducers, createActions } from "./createActions"
import { Stateful } from "./Stateful"
import { EffectAtomCallback } from "../effects/createEffect"
import { EffectDispatcher } from "../effects/EffectDispatcher"

export interface AtomConfig<
  Value,
  R extends Reducers<Value> = Reducers<Value>
> {
  /** Value that will be used initially. */
  defaultValue: Value
  /** Name of the atom. Must be unique among all atoms. Defaults to "atom-{number}". */
  name?: string
  /** Effects that will be applied on the atom. */
  effects?: EffectAtomCallback<any>[]
  /** Reducers for custom actions to set the atom's value. */
  reducers?: R
}

let key = 0

export class Atom<
  Value = unknown,
  R extends Reducers<Value> = Reducers<Value>
> extends Stateful<Value> {
  /** Default value of the atom. */
  public readonly defaultValue: Value
  /** Identifier of the atom. */
  public readonly name: string
  /** Actions that can be used to set the atom's value. */
  public readonly actions: Actions<Value, R>

  constructor({
    defaultValue,
    name = `atom-${++key}`,
    effects,
    reducers = {} as R,
  }: AtomConfig<Value, R>) {
    super(defaultValue)
    this.name = name
    this.defaultValue = defaultValue
    this.actions = createActions(this, reducers)

    if (!effects || effects.length === 0) {
      this.didInit = true
      return
    }
    const { didInit } = new EffectDispatcher({ atom: this, effects })
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
 * @param config.effects Effects that will be applied on the atom.
 * @param config.reducers Reducers for custom actions to set the atom's value.
 *
 * @returns An atom instance.
 **/
export const createAtom = <Value, R extends Reducers<Value> = Reducers<Value>>(
  config: AtomConfig<Value, R>
) => new Atom(config)
