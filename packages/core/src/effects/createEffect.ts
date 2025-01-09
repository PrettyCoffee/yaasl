import type { Updater, Dispatch } from "@yaasl/utils"

import type { Atom } from "../base"

export type ActionType = "init" | "didInit" | "set"

export interface EffectPayload<Options = undefined, AtomValue = any> {
  /** Current value of the atom */
  value: AtomValue
  /** Function to set the value of the atom */
  set: Dispatch<Updater<AtomValue>>
  /** The atom which the effect is applied on */
  atom: Atom<AtomValue>
  /** Options passed to the effect */
  options: Options
}

export interface EffectActions<Options, AtomValue> {
  /** Action to be called when the atom is created */
  init?: (payload: EffectPayload<Options, AtomValue>) => PromiseLike<any> | void

  /** Action to be called after the init phase */
  didInit?: (
    payload: EffectPayload<Options, AtomValue>
  ) => PromiseLike<any> | void
  /** Action to be called when the atom's value is set */
  set?: (payload: EffectPayload<Options, AtomValue>) => void
}

interface EffectSetupProps<Options, AtomValue> {
  atom: Atom<AtomValue>
  options: Options
}

export interface EffectMeta {
  /** Enforce a position of the effect in the execution order */
  sort?: "pre" | "post"
}

export type EffectAtomCallback<Options = unknown, AtomValue = unknown> = (
  atom: Atom<AtomValue>
) => Effect<Options, AtomValue>

type EffectSetup<Options, AtomValue> =
  | (EffectMeta & EffectActions<Options, AtomValue>)
  | ((
      props: EffectSetupProps<Options, AtomValue>
    ) => EffectMeta & EffectActions<Options, AtomValue>)

export interface Effect<Options = unknown, AtomValue = unknown> {
  meta: EffectMeta
  options: Options
  actions: EffectActions<Options, AtomValue>
}

/** Create effects to be used in combination with atoms.
 *
 * Effects can be used to interact with an atom by using the following lifecycle actions:
 *
 * - `init`: Action to be called when the atom is created, but before subscribing to `set` events.
 *   May return a promise that can be awaited by using `atom.didInit`.
 * - `didInit`: Action to be called when the atom is created, but after subscribing to `set` events.
 *   May return a promise that can be awaited by using `atom.didInit`.
 * - `set`: Action to be called when the atom's value is set.
 *
 * @param setup Effect actions or function to create effect actions.
 *   Effect actions are fired in the atom lifecycle, alongside to the subscriptions.
 *
 * @returns The effect to be used on atoms.
 **/
export const createEffect =
  <Options = undefined, AtomValue = any>(
    setup: EffectSetup<Options, AtomValue>
  ) =>
  (
    ...[optionsArg]: Options extends undefined ? [Options] | [] : [Options]
  ): EffectAtomCallback<Options, AtomValue> =>
  (atom: Atom<AtomValue>): Effect<Options, AtomValue> => {
    const options = optionsArg as Options
    const { sort, ...actions } =
      setup instanceof Function ? setup({ options, atom }) : setup
    const meta = { sort }

    return {
      meta,
      options,
      actions,
    }
  }
