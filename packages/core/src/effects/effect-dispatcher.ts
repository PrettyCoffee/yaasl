import { Updater, isPromiseLike, updater } from "@yaasl/utils"

import type {
  ActionType,
  EffectAtomCallback,
  EffectActions as EffectActionsType,
  EffectMeta,
} from "./create-effect"
import type { Atom } from "../base/create-atom"
import { Queue } from "../utils/queue"

const isTruthy = <T>(value: T): value is NonNullable<T> => !!value

export class EffectActions<Value> {
  public readonly meta?: EffectMeta

  private readonly options: unknown
  private readonly actions: EffectActionsType<unknown, Value>

  constructor(
    private readonly atom: Atom<Value>,
    effectCreator: EffectAtomCallback<unknown, Value>
  ) {
    const { meta, actions, options } = effectCreator(atom)
    this.meta = meta
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
    this.effects = effects
      .map(create => new EffectActions(atom, create))
      .sort((a, b) =>
        a.meta?.sort === "pre" || b.meta?.sort === "post"
          ? -1
          : a.meta?.sort === "post" || b.meta?.sort === "pre"
            ? 1
            : 0
      )
  }

  public dispatch(action: ActionType, startValue: Value) {
    const tasks = this.effects
      .map(effect => effect.createAction(action))
      .filter(isTruthy)

    return this.queue.push(...tasks).run(startValue)
  }
}
