import { InferValues, toArray, toVoid } from "@yaasl/utils"

import { Stateful } from "./stateful"

const allDidInit = (atoms: Stateful[]) => {
  const inits = atoms
    .map(atom => atom.didInit)
    .filter(
      (didInit): didInit is PromiseLike<void> => typeof didInit !== "boolean"
    )
  return inits.length === 0 ? true : Promise.all(inits).then(toVoid)
}

export class CombinerSelector<
  ParentAtoms extends Stateful<any> | [Stateful<any>, ...Stateful<any>[]],
  CombinedValue,
> extends Stateful<CombinedValue> {
  constructor(
    atoms: ParentAtoms,
    combiner: (...states: InferValues<ParentAtoms>) => CombinedValue
  ) {
    const atomArray = toArray(atoms)

    const selectState = () => {
      const values = atomArray.map<unknown>(atom => atom.get())
      return combiner(...(values as InferValues<ParentAtoms>))
    }

    super(selectState())
    atomArray.forEach(atom => atom.subscribe(() => this.update(selectState())))
    this.setDidInit(allDidInit(atomArray))
  }
}

/** Creates a value, selected from one or more atoms by using a combiner function.
 *
 *  @param atoms One or more atoms you need to combine to receive the new value.
 *  @param combiner Combiner function to use the atom values and create a new value.
 *
 *  @returns A CombinerSelector instance.
 **/
export const createSelector = <
  ParentAtoms extends Stateful<any> | [Stateful<any>, ...Stateful<any>[]],
  CombinedValue,
>(
  atoms: ParentAtoms,
  combiner: (...states: InferValues<ParentAtoms>) => CombinedValue
): CombinerSelector<ParentAtoms, CombinedValue> =>
  new CombinerSelector(atoms, combiner)
