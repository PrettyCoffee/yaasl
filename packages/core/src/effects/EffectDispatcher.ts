import { Updater, isPromiseLike, updater } from "@yaasl/utils"

import type {
  ActionType,
  EffectAtomCallback,
  EffectActions as EffectActionsType,
} from "./createEffect"
import type { Atom } from "../base/createAtom"
import { Queue } from "../utils/Queue"

const isTruthy = <T>(value: T): value is NonNullable<T> => !!value

export class EffectActions<Value> {
  private options: unknown
  private actions: EffectActionsType<unknown, Value>

  constructor(
    private readonly atom: Atom<Value>,
    effectCreator: EffectAtomCallback<unknown, Value>
  ) {
    const { actions, options } = effectCreator(atom)
    this.options = options
    this.actions = actions
  }

  public createAction(action: ActionType) {
    const actionFn = this.actions[action]
    if (!actionFn) return

    return (prev: Value) => {
      const nextValue = { current: prev }
      const set = (next: Updater<Value>) =>
        (nextValue.current = updater(next, nextValue.current))

      const result = actionFn({
        value: prev,
        set,
        atom: this.atom,
        options: this.options,
      })

      return isPromiseLike(result)
        ? result.then(() => nextValue.current)
        : nextValue.current
    }
  }
}

export class EffectDispatcher<Value> {
  private effects: EffectActions<Value>[] = []
  private queue = new Queue<Value>()

  constructor(
    atom: Atom<Value>,
    effects: EffectAtomCallback<unknown, Value>[]
  ) {
    this.effects = effects.map(create => new EffectActions(atom, create))
  }

  public dispatch(action: ActionType, startValue: Value) {
    const tasks = this.effects
      .map(effect => effect.createAction(action))
      .filter(isTruthy)

    return this.queue.push(...tasks).run(startValue)
  }
}
