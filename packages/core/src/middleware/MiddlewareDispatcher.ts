import { Middleware, ActionType, MiddlewareAtomCallback } from "./middleware"
import { Atom } from "../base/atom"
import { isPromise } from "../utils/isPromise"
import { Thenable } from "../utils/Thenable"

interface MiddlewareDispatcherConstructor {
  atom: Atom<any>
  middleware: MiddlewareAtomCallback<any>[]
}

export class MiddlewareDispatcher {
  public didInit: Promise<void> | boolean = false
  private middleware: Middleware[] = []

  constructor({ atom, middleware }: MiddlewareDispatcherConstructor) {
    this.middleware = middleware.map(create => create(atom))

    const result = this.callMiddlewareAction("init", atom)
      .then(() => this.subscribeSetters(atom))
      .then(() => this.callMiddlewareAction("didInit", atom))
      .then(() => {
        this.didInit = true
      })

    if (result instanceof Promise) {
      this.didInit = result
    }
  }

  private subscribeSetters(atom: Atom) {
    atom.subscribe(value => void this.callMiddlewareAction("set", atom, value))
  }

  private callMiddlewareAction(
    action: ActionType,
    atom: Atom,
    value = atom.get()
  ) {
    const result = this.middleware.map(middleware => {
      const { actions, options } = middleware
      const actionFn = actions[action]
      return actionFn?.({ value, atom, options })
    })

    const promises = result.filter(isPromise)
    return promises.length ? Promise.all(promises) : new Thenable()
  }
}
