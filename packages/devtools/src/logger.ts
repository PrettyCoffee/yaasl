import { createEffect, EffectPayload } from "@yaasl/core"

export interface LoggerOptions {
  /** Disables the middleware. */
  disable?: boolean
}

const createLogger =
  (text: string) =>
  ({ atom, value, options }: EffectPayload<LoggerOptions | undefined>) => {
    if (options?.disable) return
    console.log(`[YAASL]["${atom.name}"]: ${text}`, value)
  }

/** Effect to monitor atom activities and log them to the console.
 *
 *  @param options.disable Disables the middleware.
 *
 *  @returns The effect to be used on atoms.
 **/
export const logger = createEffect<LoggerOptions | undefined>({
  init: createLogger("Initialize"),
  didInit: createLogger("Finished initialization"),
  set: createLogger("Set value"),
})
