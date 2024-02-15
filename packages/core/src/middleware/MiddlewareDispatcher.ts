import { Middleware, ActionType, MiddlewareAtomCallback } from "./middleware"
import { Atom } from "../base/atom"
import { isPromiseLike } from "../utils/isPromiseLike"
import { Scheduler } from "../utils/Scheduler"

interface MiddlewareDispatcherConstructor {
  atom: Atom<any>
  middleware: MiddlewareAtomCallback<any>[]
}

export class MiddlewareDispatcher {
  public didInit: PromiseLike<void> | boolean = false
  private middleware: Middleware[] = []
  private scheduler = new Scheduler()

  constructor({ atom, middleware }: MiddlewareDispatcherConstructor) {
    this.middleware = middleware.map(create => create(atom))

    this.callMiddlewareAction("init", atom)
    this.subscribeSetters(atom)
    this.callMiddlewareAction("didInit", atom)

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
    atom.subscribe(value => this.callMiddlewareAction("set", atom, () => value))
  }

  private callMiddlewareAction(
    action: ActionType,
    atom: Atom,
    /* Must be a function to make sure it is using the latest value when used in promise */
    getValue = () => atom.get()
  ) {
    const tasks = this.middleware.map(({ actions, options }) => {
      const actionFn = actions[action]
      return () => actionFn?.({ value: getValue(), atom, options })
    })

    void this.scheduler.run(tasks)
  }
}
