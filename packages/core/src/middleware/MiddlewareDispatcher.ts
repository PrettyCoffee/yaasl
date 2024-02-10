import { Middleware, ActionType, MiddlewareAtomCallback } from "./middleware"
import { Atom } from "../base/atom"

interface MiddlewareDispatcherConstructor {
  atom: Atom<any>
  middleware: MiddlewareAtomCallback<any>[]
}

export class MiddlewareDispatcher {
  private middleware: Middleware[] = []

  constructor({ atom, middleware }: MiddlewareDispatcherConstructor) {
    this.middleware = middleware.map(create => create(atom))

    this.callMiddlewareAction("init", atom)
    this.subscribeSetters(atom)
    this.callMiddlewareAction("didInit", atom)
  }

  private subscribeSetters(atom: Atom) {
    atom.subscribe(value => this.callMiddlewareAction("set", atom, value))
  }

  private callMiddlewareAction(
    action: ActionType,
    atom: Atom,
    value = atom.get()
  ) {
    this.middleware.forEach(middleware => {
      const { actions, options } = middleware
      const actionFn = actions[action]
      actionFn?.({ value, atom, options })
    })
  }
}
