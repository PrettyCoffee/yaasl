import { Updater, updater } from "@yaasl/utils"

import { CONFIG } from "./config"
import { Stateful } from "./Stateful"
import { EffectAtomCallback } from "../effects/createEffect"
import { EffectDispatcher } from "../effects/EffectDispatcher"

export interface AtomConfig<Value> {
  /** Value that will be used initially. */
  defaultValue: Value
  /** Name of the atom. Must be unique among all atoms. Defaults to "atom-{number}". */
  name?: string
  /** Effects that will be applied on the atom. */
  effects?: EffectAtomCallback<any>[]
}

let key = 0

export class Atom<Value = unknown> extends Stateful<Value> {
  /** Default value of the atom. */
  public readonly defaultValue: Value
  /** Identifier of the atom. */
  public readonly name: string

  constructor({
    defaultValue,
    name = `atom-${++key}`,
    effects: localEffects = [],
  }: AtomConfig<Value>) {
    super(defaultValue)
    this.name = name
    this.defaultValue = defaultValue

    const effects = [...CONFIG.globalEffects, ...localEffects]

    if (effects.length === 0) {
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
  public set(next: Updater<Value>) {
    super.update(updater(next, this.get()))
  }
}

/** Creates an atom store.
 *
 * @param config.defaultValue Value that will be used initially.
 * @param config.name Name of the atom. Must be unique among all atoms. Defaults to "atom-{number}".
 * @param config.effects Effects that will be applied on the atom.
 *
 * @returns An atom instance.
 **/
export const createAtom = <Value>(config: AtomConfig<Value>) => new Atom(config)
