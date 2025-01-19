import { Actions, Reducers, createActions } from "./createActions"
import { Atom, AtomConfig } from "./createAtom"
import {
  CombinerSelector,
  ObjPath,
  PathSelector,
  createSelector,
} from "./createSelector"

const isEmpty = (obj?: unknown): obj is undefined =>
  !obj || Object.keys(obj).length === 0

interface ReducersProp<State, R extends Reducers<State> | undefined> {
  /** Reducers for custom actions to set the atom's value. */
  reducers?: R
}

type Selectors<State> = Record<string, ObjPath<State> | ((state: State) => any)>

type ConditionalActions<State, R> = keyof R extends never
  ? {}
  : R extends Reducers<State>
    ? {
        /** Actions that can be used to set the atom's value. */
        actions: Actions<State, R>
      }
    : {}

interface SelectorsProp<State, S extends Selectors<State> | undefined> {
  /** Selectors to create values from the atom. */
  selectors?: S
}

type GetSelector<State, S extends ObjPath<State> | ((state: State) => any)> =
  S extends ObjPath<State>
    ? PathSelector<State, S>
    : S extends (state: State) => any
      ? CombinerSelector<[Atom<State>], ReturnType<S>>
      : never

type ConditionalSelectors<State, S> = keyof S extends never
  ? {}
  : S extends Selectors<State>
    ? {
        /** Selectors to create new values based on the atom's value. */
        selectors: {
          [K in keyof S]: GetSelector<State, S[K]>
        }
      }
    : {}

const createSelectors = <State, S extends Selectors<State>>(
  atom: Atom<State>,
  selectors: S
) =>
  Object.fromEntries(
    Object.entries(selectors).map(([key, selector]) => [
      key,
      typeof selector === "string"
        ? createSelector(atom, selector)
        : createSelector([atom], selector),
    ])
  ) as { [K in keyof S]: GetSelector<State, S[K]> }

/** Creates a slice with actions and selectors.
 *
 * @param config.defaultValue Value that will be used initially.
 * @param config.name Name of the atom.
 * @param config.effects Effects that will be applied on the atom.
 * @param config.reducers Reducers for custom actions to set the atom's value.
 * @param config.selectors Path or combiner selectors to use the atom's values to create new ones.
 *
 * @returns An atom instance with actions and selectors.
 **/
export const createSlice = <
  State,
  R extends Reducers<State> | undefined,
  S extends Selectors<State> | undefined,
>(
  config: AtomConfig<State> & ReducersProp<State, R> & SelectorsProp<State, S>
) => {
  const atom = new Atom(config)

  const actionsProp = isEmpty(config.reducers)
    ? {}
    : {
        actions: createActions(atom, config.reducers),
      }

  const selectorsProp = isEmpty(config.selectors)
    ? {}
    : {
        selectors: createSelectors(atom, config.selectors),
      }

  return Object.assign(
    atom,
    actionsProp as ConditionalActions<State, R>,
    selectorsProp as ConditionalSelectors<State, S>
  )
}
