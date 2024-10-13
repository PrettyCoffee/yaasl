import { consoleMessage, Updater, toVoid, updater } from "@yaasl/utils"

import { Atom } from "./createAtom"
import { Stateful } from "./Stateful"

const allDidInit = (atoms: Stateful[]) => {
  const inits = atoms
    .map(atom => atom.didInit)
    .filter(
      (didInit): didInit is PromiseLike<void> => typeof didInit !== "boolean"
    )
  return inits.length === 0 ? true : Promise.all(inits).then(toVoid)
}

type GetterFn<Value> = (context: { get: <V>(dep: Stateful<V>) => V }) => Value

type SetterFn<Value> = (context: {
  value: Value
  set: <V>(dep: Atom<V> | SettableDerive<V>, next: Updater<V>) => void
}) => void

export class Derive<Value> extends Stateful<Value> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected readonly getterDependencies = new Set<Stateful<any>>()

  constructor(private readonly getter: GetterFn<Value>) {
    super(undefined as Value)
    this.value = getter({ get: dep => this.addGetDependency(dep) })
    this.setDidInit(allDidInit(Array.from(this.getterDependencies)))
  }

  private addGetDependency<V>(dependency: Stateful<V>) {
    if (!this.getterDependencies.has(dependency)) {
      dependency.subscribe(() => this.deriveUpdate())
      this.getterDependencies.add(dependency)
    }

    return dependency.get()
  }

  private deriveUpdate() {
    this.update(this.getter({ get: dep => this.addGetDependency(dep) }))
  }
}

export class SettableDerive<Value = unknown> extends Derive<Value> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected readonly setterDependencies = new Set<
    Atom<any> | SettableDerive<any>
  >()

  constructor(
    getter: GetterFn<Value>,
    private readonly setter: SetterFn<Value>
  ) {
    super(getter)
    setter({
      value: this.get(),
      set: dep => this.addSetDependency(dep),
    })
    if (!this.compareDependencies()) {
      throw new Error(
        consoleMessage(
          "The set and get dependencies of a derived atom do not match."
        )
      )
    }
  }

  /** Set the value of the derived atom.
   *
   * @param next New value or function to create the
   * new value based off the previous value.
   */
  public set(next: Updater<Value>) {
    const oldState = this.get()
    const newState = updater(next, oldState)
    if (oldState === newState) return

    this.setter({
      value: newState,
      set: (atom, next) => {
        const value = updater(next, atom.get())
        atom.set(value)
      },
    })
  }

  private addSetDependency<V>(dependency: Atom<V> | SettableDerive<V>) {
    if (!this.setterDependencies.has(dependency)) {
      this.setterDependencies.add(dependency)
    }
  }

  private compareDependencies() {
    const { getterDependencies, setterDependencies } = this
    if (getterDependencies.size !== setterDependencies.size) {
      return false
    }

    return Array.from(setterDependencies).every(dependency =>
      getterDependencies.has(dependency)
    )
  }
}

/** A derive atom that allows deriving and elevating values from and
 *  to one or multiple other stateful elements.
 *
 *  **Note:**
 *    - `getter` and `setter` should not have any side effects
 *    - `getter` and `setter` must use the same atoms
 *
 *  @param getter Function to derive a new value from other stateful elements.
 *  @param setter Function to elevate a new value to it's stateful dependents.
 *
 *  @returns A derive instance.
 **/
export function createDerived<Value>(getter: GetterFn<Value>): Derive<Value>
export function createDerived<Value>(
  getter: GetterFn<Value>,
  setter: SetterFn<Value>
): SettableDerive<Value>

export function createDerived<Value>(
  getter: GetterFn<Value>,
  setter?: SetterFn<Value>
) {
  if (setter) {
    return new SettableDerive(getter, setter)
  } else {
    return new Derive(getter)
  }
}
