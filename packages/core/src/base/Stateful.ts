import { Destroyable } from "./Destroyable"

export type Callback<Value> = (value: Value, previous: Value) => void

export class Stateful<Value = unknown> extends Destroyable {
  /** Promise that resolves when the states initialization was finished. */
  public didInit: PromiseLike<void> | boolean = false

  private listeners = new Set<Callback<Value>>()

  constructor(protected value: Value) {
    super()
  }

  /** Read the value of state.
   *
   * @returns The current value.
   **/
  public get() {
    return this.value
  }

  /** Subscribe to value changes.
   *
   *  @param callback Function to use the new value.
   *
   *  @returns A callback to unsubscribe the passed callback.
   */
  public subscribe(callback: Callback<Value>) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  /** Make this atom unusable and remove all references
   **/
  public destroy() {
    super.destroy()
    this.value = null as Value
    this.listeners = new Set()
  }

  private emit(value: Value, previous: Value) {
    this.listeners.forEach(listener => listener(value, previous))
  }

  protected update(value: Value) {
    if (this.value !== value) {
      const previous = this.value
      this.value = value
      this.emit(value, previous)
    }
  }

  protected setDidInit(didInit: boolean | PromiseLike<void>) {
    if (typeof didInit === "boolean") {
      this.didInit = true
    } else {
      this.didInit = didInit.then(() => {
        this.didInit = true
      })
    }
  }
}
