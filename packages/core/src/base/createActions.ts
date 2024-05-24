import { Atom } from "./atom"
import { SettableDerive } from "./derive"

type Reducer<State> = (state: State, payload: any) => State
export type Reducers<State> = Record<string, Reducer<State>>

type Payload<R extends Reducer<any>> = Parameters<R>[1] extends undefined
  ? []
  : [payload: Parameters<R>[1]]

export type Actions<State, R extends Reducers<State>> = {
  [K in keyof R]: (...args: Payload<R[K]>) => void
}

/** Create actions to change the state of an atom.
 *
 *  @param atom Atom to be used.
 *  @param reducers Reducers for custom actions to set the atoms value.
 *
 *  @returns Actions to change the state of the atom.
 *
 *  @example
 *  const counter = atom({ defaultValue: 0 })
 *  const actions = createActions(counter, {
 *    increment: (state) => state + 1,
 *    decrement: (state) => state - 1,
 *    add: (state, value: number) => state + value,
 *    subtract: (state, value: number) => state - value,
 *  })
 *  actions.increment()
 *  actions.add(5)
 **/
export const createActions = <State, R extends Reducers<State>>(
  atom: Atom<State> | SettableDerive<State>,
  reducers: R
) =>
  Object.entries(reducers).reduce<Actions<State, Reducers<State>>>(
    (result, [key, reducerFn]) => {
      result[key] = (payload?: unknown) => {
        atom.set((state: State) => reducerFn(state, payload))
      }
      return result
    },
    {}
  ) as Actions<State, R>
