export class Stateful<Value = unknown> {
  private listeners = new Set<(value: Value) => void>()

  constructor(protected value: Value) {}

  snapshot() {
    return this.value
  }

  subscribe(callback: (value: Value) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private emit() {
    this.listeners.forEach(listener => listener(this.snapshot()))
  }

  protected update(value: Value) {
    if (this.value !== value) {
      this.value = value
      this.emit()
    }
  }
}
