import { consoleMessage } from "@yaasl/utils"

import type { Callback, Stateful } from "./Stateful"

export class Destroyable {
  public isDestroyed = false
  private dependents = new Set<Destroyable>()
  private unsubscribers = new Set<() => void>()

  /** Make this atom unusable and remove all references.
   **/
  public destroy() {
    this.dependents.forEach(dependent => dependent.destroy())
    this.unsubscribers.forEach(unsubscribe => unsubscribe())
    this.dependents.clear()
    this.unsubscribers.clear()
    this.isDestroyed = true

    const throwOnCall = () => {
      const name = "name" in this ? (this.name as string) : undefined
      throw new Error(
        consoleMessage("The methods of a destroyed atom cannot be called.", {
          scope: name,
        })
      )
    }

    Object.assign(this, {
      set: throwOnCall,
      get: throwOnCall,
      subscribe: throwOnCall,
    })
  }

  /** Subscribe to another atom and automatically destroy the atom instance, if the parent is destroyed */
  protected subscribeTo<T>(parent: Stateful<T>, callback: Callback<T>) {
    parent.addDependent(this)
    const unsubscribe = parent.subscribe(callback)

    this.unsubscribers.add(() => {
      unsubscribe()
      parent.removeDependent(this)
    })
  }

  protected addDependent(dependent: Destroyable) {
    this.dependents.add(dependent)
  }

  protected removeDependent(dependent: Destroyable) {
    this.dependents.delete(dependent)
  }
}
