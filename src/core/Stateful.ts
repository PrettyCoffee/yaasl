export class Stateful<Value = unknown> {
  private listeners = new Set<(value: Value) => void>()

  constructor(protected value: Value) {}

  /** Read the value of state.
   *
   * @returns The current value.
   **/
  get() {
    return this.value
  }

  /** Subscribe to value changes.
   *
   *  @param callback Function to use the new value.
   *
   *  @returns A callback to unsubscribe the passed callback.
   */
  subscribe(callback: (value: Value) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private emit() {
    this.listeners.forEach(listener => listener(this.get()))
  }

  protected update(value: Value) {
    if (this.value !== value) {
      this.value = value
      this.emit()
    }
  }
}
