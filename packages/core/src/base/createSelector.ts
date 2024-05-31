import { Prettify, toVoid } from "@yaasl/utils"

import { Stateful } from "./Stateful"

// -- Path selector

type PathableValue = Record<string | number, unknown>

export type ObjPath<Obj> = Prettify<Obj> extends PathableValue
  ? {
      [K in keyof Obj]: `${Exclude<K, symbol>}${"" | `.${ObjPath<Obj[K]>}`}`
    }[keyof Obj]
  : never

type ObjPathValue<State, Path> = State extends PathableValue
  ? Path extends `${infer Current}.${infer Next}`
    ? ObjPathValue<State[Current], Next>
    : State[Path & string]
  : never

const selectPath = <ParentValue, Path extends ObjPath<ParentValue>>(
  state: ParentValue,
  path: Path
) =>
  path
    .split(".")
    .reduce<unknown>(
      (result, key) => (result as Record<string, unknown>)[key],
      state
    ) as ObjPathValue<ParentValue, Path>

export class PathSelector<
  ParentValue,
  Path extends ObjPath<ParentValue>
> extends Stateful<ObjPathValue<ParentValue, Path>> {
  constructor(atom: Stateful<ParentValue>, path: Path) {
    super(selectPath(atom.get(), path))
    atom.subscribe(state => this.update(selectPath(state, path)))
    this.setDidInit(atom.didInit)
  }
}

// -- Combiner selector

const allDidInit = (atoms: Stateful[]) => {
  const inits = atoms
    .map(atom => atom.didInit)
    .filter(
      (didInit): didInit is PromiseLike<void> => typeof didInit !== "boolean"
    )
  return inits.length === 0 ? true : Promise.all(inits).then(toVoid)
}

type InferValuesFromAtoms<
  ParentAtoms extends readonly unknown[],
  ParentValues extends unknown[] = []
> = ParentAtoms extends [Stateful<infer Value>, ...infer Rest]
  ? InferValuesFromAtoms<Rest, [...ParentValues, Value]>
  : ParentValues

export class CombinerSelector<
  ParentAtoms extends [Stateful<any>, ...Stateful<any>[]],
  CombinedValue
> extends Stateful<CombinedValue> {
  constructor(
    atoms: ParentAtoms,
    combiner: (...res: InferValuesFromAtoms<ParentAtoms>) => CombinedValue
  ) {
    const selectState = () => {
      const values = atoms.map<unknown>(atom => atom.get())
      return combiner(...(values as InferValuesFromAtoms<ParentAtoms>))
    }

    super(selectState())
    atoms.forEach(atom => atom.subscribe(() => this.update(selectState())))
    this.setDidInit(allDidInit(atoms))
  }
}

// -- createSelector implementation

interface CreateSelectorOverloads {
  /** Creates a value, selected from one atom with an object value by using a key path.
   *
   *  @param atom The atom to select a value from. The internal state must be an object.
   *  @param path The path to the value you want to select.
   *
   *  @returns A PathSelector instance.
   **/
  <ParentValue, Path extends ObjPath<ParentValue>>(
    atom: Stateful<ParentValue>,
    path: Path
  ): PathSelector<ParentValue, Path>

  /** Creates a value, selected from one atom with an object value by using a key path.
   *
   *  @param atoms Atoms you need to combine to receive the new value.
   *  @param combiner Combiner function to use the atom values and create a new value.
   *
   *  @returns A CombinerSelector instance.
   **/
  <ParentAtoms extends [Stateful<any>, ...Stateful<any>[]], CombinedValue>(
    states: ParentAtoms,
    combiner: (...res: InferValuesFromAtoms<ParentAtoms>) => CombinedValue
  ): CombinerSelector<ParentAtoms, CombinedValue>
}

export const createSelector: CreateSelectorOverloads = (
  atoms: [Stateful<any>, ...Stateful<any>[]] | Stateful<any>,
  selector: ((...args: any[]) => any) | string
) => {
  if (atoms instanceof Stateful && typeof selector === "string") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return new PathSelector(atoms, selector)
  }
  if (Array.isArray(atoms) && typeof selector === "function") {
    return new CombinerSelector(atoms, selector)
  }
  throw new Error("Selector args do not match any overload")
}
