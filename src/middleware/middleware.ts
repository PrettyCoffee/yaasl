import { Atom, Store, ActionPayload, ActionType, UnknownAtom } from "../core"
import { freeze } from "../utils/freeze"

interface MiddlewarePayload<Options> extends Omit<ActionPayload, "type"> {
  store: Store
  atom: Atom
  options: Options
}

type MiddlewareAction<Options> = (payload: MiddlewarePayload<Options>) => void

type MiddlewareActions<Options> = Partial<
  Record<ActionType, MiddlewareAction<Options>>
>

interface MiddlewareSetupProps<Options> {
  atom: UnknownAtom
  options: Options
}

export type MiddlewareAtomCallback<Options> = (
  atom: UnknownAtom
) => Middleware<Options>

export type MiddlewareSetup<Options> =
  | MiddlewareActions<Options>
  | ((props: MiddlewareSetupProps<Options>) => MiddlewareActions<Options>)

export interface Middleware<Options = unknown> {
  options: Options
  actions: MiddlewareActions<Options>
}

/** Create middlewares to be used in combination with a atoms.
 *
 * @param setup Middleware actions or function to create middleware actions.
 *   Middleware actions are fired in the atom lifecycle, alongside to the subscriptions.
 *
 * @returns A middleware function to be used in atoms
 **/
export const middleware =
  <Options = undefined>(setup: MiddlewareSetup<Options>) =>
  (
    ...[optionsArg]: Options extends undefined ? [Options] | [] : [Options]
  ): MiddlewareAtomCallback<Options> =>
  (atom: UnknownAtom): Middleware<Options> => {
    const options = optionsArg as Options
    const actions = setup instanceof Function ? setup({ options, atom }) : setup
    return {
      options,
      actions,
    }
  }

export interface Middleware2<Options = unknown> {
  options: Options
  hook: MiddlewareAction<Options>
}

/** Create middlewares to be used in combination with a atoms.
 *
 * @param hook Callback that is fired when the atom changes in a store.
 * @returns A middleware function to be used in atoms
 **/
export const middleware2 =
  <Options = undefined>(hook: MiddlewareAction<Options>) =>
  (
    ...[options]: Options extends undefined ? [Options] | [] : [Options]
  ): Readonly<Middleware2<Options>> =>
    freeze({ options: options as Options, hook })
