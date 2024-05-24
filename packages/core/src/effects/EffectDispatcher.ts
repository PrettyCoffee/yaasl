import { isPromiseLike } from "@yaasl/utils"

import { Effect, ActionType, EffectAtomCallback } from "./createEffect"
import { Atom } from "../base/createAtom"
import { Scheduler } from "../utils/Scheduler"

interface EffectDispatcherConstructor {
  atom: Atom<any>
  effects: EffectAtomCallback<any>[]
}

export class EffectDispatcher {
  public didInit: PromiseLike<void> | boolean = false
  private effects: Effect[] = []
  private scheduler = new Scheduler()

  constructor({ atom, effects }: EffectDispatcherConstructor) {
    this.effects = effects.map(create => create(atom))

    this.callEffectAction("init", atom)
    this.subscribeSetters(atom)
    this.callEffectAction("didInit", atom)

    const { queue } = this.scheduler
    if (!isPromiseLike(queue)) {
      this.didInit = true
      return
    }
    this.didInit = queue.then(() => {
      this.didInit = true
    })
  }

  private subscribeSetters(atom: Atom) {
    atom.subscribe(value => this.callEffectAction("set", atom, () => value))
  }

  private callEffectAction(
    action: ActionType,
    atom: Atom,
    /* Must be a function to make sure it is using the latest value when used in promise */
    getValue = () => atom.get()
  ) {
    const tasks = this.effects.map(({ actions, options }) => {
      const actionFn = actions[action]
      return () => actionFn?.({ value: getValue(), atom, options })
    })

    void this.scheduler.run(tasks)
  }
}
