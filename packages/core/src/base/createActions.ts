import type { Atom } from "./createAtom"
import type { SettableDerive } from "./createDerived"

type Reducer<State> = (state: State, ...payloadArgs: any[]) => State
export type Reducers<State> = Record<string, Reducer<State>>

type Payload<R extends Reducer<any>> =
  Parameters<R> extends [any, ...infer PayloadArgs] ? PayloadArgs : []

export type Actions<State, R extends Reducers<State>> = {
  [K in keyof R]: (...payloadArgs: Payload<R[K]>) => void
}

/** Create actions to change the state of an atom.
 *
 *  @param atom Atom to be used.
 *  @param reducers Reducers for custom actions to set the atom's value.
 *
 *  @returns Actions to change the state of the atom.
 *
 *  @example
 *  const counter = createAtom({ defaultValue: 0 })
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
      result[key] = (...payloadArgs: unknown[]) => {
        atom.set((state: State) => reducerFn(state, ...payloadArgs))
      }
      return result
    },
    {}
  ) as Actions<State, R>
