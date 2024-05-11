import { Atom } from "../base"

export type ActionType = "init" | "didInit" | "set"

interface MiddlewarePayload<Options, AtomValue> {
  value: AtomValue
  atom: Atom<AtomValue>
  options: Options
}

interface MiddlewareActions<Options, AtomValue> {
  init?: (payload: MiddlewarePayload<Options, AtomValue>) => Promise<any> | void
  didInit?: (
    payload: MiddlewarePayload<Options, AtomValue>
  ) => Promise<any> | void
  set?: (payload: MiddlewarePayload<Options, AtomValue>) => void
}

interface MiddlewareSetupProps<Options, AtomValue> {
  atom: Atom<AtomValue>
  options: Options
}

export type MiddlewareAtomCallback<Options = unknown, AtomValue = unknown> = (
  atom: Atom<AtomValue>
) => Middleware<Options, AtomValue>

type MiddlewareSetup<Options, AtomValue> =
  | MiddlewareActions<Options, AtomValue>
  | ((
      props: MiddlewareSetupProps<Options, AtomValue>
    ) => MiddlewareActions<Options, AtomValue>)

export interface Middleware<Options = unknown, AtomValue = unknown> {
  options: Options
  actions: MiddlewareActions<Options, AtomValue>
}

/** Create middlewares to be used in combination with atoms.
 *
 * @param setup Middleware actions or function to create middleware actions.
 *   Middleware actions are fired in the atom lifecycle, alongside to the subscriptions.
 *
 * @returns A middleware function to be used in atoms.
 **/
export const middleware =
  <Options = undefined, AtomValue = any>(
    setup: MiddlewareSetup<Options, AtomValue>
  ) =>
  (
    ...[optionsArg]: Options extends undefined ? [Options] | [] : [Options]
  ): MiddlewareAtomCallback<Options, AtomValue> =>
  (atom: Atom<AtomValue>): Middleware<Options, AtomValue> => {
    const options = optionsArg as Options
    const actions = setup instanceof Function ? setup({ options, atom }) : setup

    return {
      options,
      actions,
    }
  }
