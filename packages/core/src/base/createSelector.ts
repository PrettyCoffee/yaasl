import { toVoid } from "@yaasl/utils"

import { Stateful } from "./Stateful"

// -- Path selector

type PathableState = Record<string | number, unknown>

type DeepKeys<State> = State extends PathableState
  ? {
      [K in keyof State]: `${Exclude<K, symbol>}${
        | ""
        | `.${DeepKeys<State[K]>}`}`
    }[keyof State]
  : never

type DeepValue<State, Path> = State extends PathableState
  ? Path extends `${infer Current}.${infer Next}`
    ? DeepValue<State[Current], Next>
    : State[Path & string]
  : never

const selectPath = <State, Path extends DeepKeys<State>>(
  state: State,
  path: Path
) =>
  path
    .split(".")
    .reduce<unknown>(
      (result, key) => (result as Record<string, unknown>)[key],
      state
    ) as DeepValue<State, Path>

export class PathSelector<State, Path extends DeepKeys<State>> extends Stateful<
  DeepValue<State, Path>
> {
  constructor(atom: Stateful<State>, path: Path) {
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
  Atoms extends readonly unknown[],
  States extends unknown[] = []
> = Atoms extends [Stateful<infer Value>, ...infer Rest]
  ? InferValuesFromAtoms<Rest, [...States, Value]>
  : States

export class CombinerSelector<
  State,
  Atoms extends [Stateful<any>, ...Stateful<any>[]]
> extends Stateful<State> {
  constructor(
    atoms: Atoms,
    combiner: (...res: InferValuesFromAtoms<Atoms>) => State
  ) {
    const selectState = () => {
      const values = atoms.map<unknown>(atom => atom.get())
      return combiner(...(values as InferValuesFromAtoms<Atoms>))
    }

    super(selectState())
    atoms.forEach(atom => atom.subscribe(() => this.update(selectState())))
    this.setDidInit(allDidInit(atoms))
  }
}

// -- createSelector implmentation

interface CreateSelectorOverloads {
  /** Creates a value, selected from one atom with an object value by using a key path.
   *
   *  @param atom The atom to select a value from. The internal state must be an object.
   *  @param path The path to the value you want to select.
   *
   *  @returns A PathSelector instance.
   **/
  <State, Path extends DeepKeys<State>>(
    atom: Stateful<State>,
    path: Path
  ): PathSelector<State, Path>

  /** Creates a value, selected from one atom with an object value by using a key path.
   *
   *  @param atoms Atoms you need to combine to receive the new value.
   *  @param combiner Combiner function to use the atom values and create a new value.
   *
   *  @returns A CombinerSelector instance.
   **/
  <Atoms extends [Stateful<any>, ...Stateful<any>[]], CombinedState>(
    states: Atoms,
    combiner: (...res: InferValuesFromAtoms<Atoms>) => CombinedState
  ): CombinerSelector<CombinedState, Atoms>
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
