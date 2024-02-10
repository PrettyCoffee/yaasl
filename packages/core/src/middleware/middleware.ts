import { Atom } from "../base"

export type ActionType = "init" | "didInit" | "set"

interface MiddlewarePayload<Options> {
  value: unknown
  atom: Atom
  options: Options
}

export interface MiddlewareActions<Options> {
  init?: (payload: MiddlewarePayload<Options>) => Promise<any> | void
  didInit?: (payload: MiddlewarePayload<Options>) => Promise<any> | void
  set?: (payload: MiddlewarePayload<Options>) => void
}

interface MiddlewareSetupProps<Options> {
  atom: Atom
  options: Options
}

export type MiddlewareAtomCallback<Options> = (
  atom: Atom<any>
) => Middleware<Options>

export type MiddlewareSetup<Options> =
  | MiddlewareActions<Options>
  | ((props: MiddlewareSetupProps<Options>) => MiddlewareActions<Options>)

export interface Middleware<Options = unknown> {
  options: Options
  actions: MiddlewareActions<Options>
}

/** Create middlewares to be used in combination with atoms.
 *
 * @param setup Middleware actions or function to create middleware actions.
 *   Middleware actions are fired in the atom lifecycle, alongside to the subscriptions.
 *
 * @returns A middleware function to be used in atoms.
 **/
export const middleware =
  <Options = undefined>(setup: MiddlewareSetup<Options>) =>
  (
    ...[optionsArg]: Options extends undefined ? [Options] | [] : [Options]
  ): MiddlewareAtomCallback<Options> =>
  (atom: Atom): Middleware<Options> => {
    const options = optionsArg as Options
    const actions = setup instanceof Function ? setup({ options, atom }) : setup

    return {
      options,
      actions,
    }
  }
