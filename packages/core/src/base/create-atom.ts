import { Updater, updater, Thenable, toVoid } from "@yaasl/utils"

import { CONFIG } from "./config"
import { Stateful } from "./stateful"
import type { EffectAtomCallback } from "../effects/create-effect"
import { EffectDispatcher } from "../effects/effect-dispatcher"

export interface AtomConfig<Value> {
  /** Value that will be used initially. */
  defaultValue: Value
  /** Name of the atom. Must be unique among all atoms. Defaults to "atom-{number}". */
  name?: string
  /** Effects that will be applied on the atom. */
  effects?: EffectAtomCallback<any, any>[]
}

let key = 0

export class Atom<Value = unknown> extends Stateful<Value> {
  /** Default value of the atom. */
  public readonly defaultValue: Value
  /** Identifier of the atom. */
  public readonly name: string

  private effects: EffectDispatcher<Value>

  constructor({
    defaultValue,
    name = `atom-${++key}`,
    effects: localEffects = [],
  }: AtomConfig<Value>) {
    super(defaultValue)
    this.name = name
    this.defaultValue = defaultValue

    const effects: EffectAtomCallback<any, any>[] = [
      ...CONFIG.globalEffects,
      ...localEffects,
    ]
    this.effects = new EffectDispatcher<Value>(this, effects)

    if (effects.length === 0) {
      this.setDidInit(true)
      return
    }

    const result = this.initEffects()
    if (result instanceof Thenable) {
      this.setDidInit(true)
    } else {
      this.setDidInit(result.then(toVoid))
    }
  }

  private initEffects() {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const updateValue = (value: Value) => {
      super.update(value)
      return value
    }
    return new Thenable(this.defaultValue)
      .then(value => this.effects.dispatch("init", value))
      .then(updateValue)
      .then(value => this.effects.dispatch("didInit", value))
      .then(updateValue)
  }

  /** Set the value of the atom.
   *
   * @param next New value or function to create the
   * new value based off the previous value.
   */
  public set(next: Updater<Value>) {
    const oldState = this.get()
    const newState = updater(next, oldState)
    if (oldState === newState) return

    void this.effects
      .dispatch("set", newState)
      .then(value => super.update(value))
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
