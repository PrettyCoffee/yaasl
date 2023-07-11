import { Stateful } from "./Stateful"

type Derivation<T> = (context: { get: <V>(dep: Stateful<V>) => V }) => T

export class Derive<DerivedValue> extends Stateful<DerivedValue> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private dependencies = new Set<Stateful<any>>()

  constructor(private readonly derivation: Derivation<DerivedValue>) {
    super(undefined as DerivedValue)
    this.value = derivation({ get: dep => this.addDependency(dep) })
  }

  private addDependency<V>(dependency: Stateful<V>) {
    if (!this.dependencies.has(dependency)) {
      dependency.subscribe(() => this.deriveUpdate())
      this.dependencies.add(dependency)
    }

    return dependency.snapshot()
  }

  private deriveUpdate() {
    this.update(this.derivation({ get: dep => this.addDependency(dep) }))
  }
}

export const derive = <DerivedValue>(get: Derivation<DerivedValue>) =>
  new Derive(get)
