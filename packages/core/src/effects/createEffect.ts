import { Updater, Dispatch } from "@yaasl/utils"

import { Atom } from "../base"

export type ActionType = "init" | "didInit" | "set"

export interface EffectPayload<Options = undefined, AtomValue = any> {
  value: AtomValue
  set: Dispatch<Updater<AtomValue>>
  atom: Atom<AtomValue>
  options: Options
}

export interface EffectActions<Options, AtomValue> {
  init?: (payload: EffectPayload<Options, AtomValue>) => PromiseLike<any> | void
  didInit?: (
    payload: EffectPayload<Options, AtomValue>
  ) => PromiseLike<any> | void
  set?: (payload: EffectPayload<Options, AtomValue>) => void
}

interface EffectSetupProps<Options, AtomValue> {
  atom: Atom<AtomValue>
  options: Options
}

export type EffectAtomCallback<Options = unknown, AtomValue = unknown> = (
  atom: Atom<AtomValue>
) => Effect<Options, AtomValue>

type EffectSetup<Options, AtomValue> =
  | EffectActions<Options, AtomValue>
  | ((
      props: EffectSetupProps<Options, AtomValue>
    ) => EffectActions<Options, AtomValue>)

export interface Effect<Options = unknown, AtomValue = unknown> {
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
    const actions = setup instanceof Function ? setup({ options, atom }) : setup

    return {
      options,
      actions,
    }
  }
