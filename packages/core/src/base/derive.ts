import { Stateful } from "./Stateful"

type DeriveFn<Value> = (context: { get: <V>(dep: Stateful<V>) => V }) => Value

export class Derive<Value> extends Stateful<Value> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private dependencies = new Set<Stateful<any>>()

  constructor(private readonly derive: DeriveFn<Value>) {
    super(undefined as Value)
    this.value = derive({ get: dep => this.addDependency(dep) })
  }

  private addDependency<V>(dependency: Stateful<V>) {
    if (!this.dependencies.has(dependency)) {
      dependency.subscribe(() => this.deriveUpdate())
      this.dependencies.add(dependency)
    }

    return dependency.get()
  }

  private deriveUpdate() {
    this.update(this.derive({ get: dep => this.addDependency(dep) }))
  }
}

/** Creates a value, derived from one or more atoms or other derived values.
 *
 *  @param get Function to derive the new value.
 *
 *  @returns A derived instance.
 **/
export const derive = <Value>(get: DeriveFn<Value>) => new Derive(get)
