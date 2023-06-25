import { Atom, Store, ActionPayload } from "../core"
import { freeze } from "../utils/freeze"

interface MiddlewarePayload<Options> extends ActionPayload {
  store: Store
  atom: Atom
  options: Options
}

type MiddlewareHook<Options> = (payload: MiddlewarePayload<Options>) => void

export interface Middleware<Options = unknown> {
  options: Options
  hook: MiddlewareHook<Options>
}

export const middleware =
  <Options = undefined>(hook: MiddlewareHook<Options>) =>
  (
    ...[options]: Options extends undefined ? [Options] | [] : [Options]
  ): Readonly<Middleware<Options>> =>
    freeze({ options: options as Options, hook })
