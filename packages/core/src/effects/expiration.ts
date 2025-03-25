import { toVoid, getWindow } from "@yaasl/utils"

import { createEffect } from "./create-effect"
import { CONFIG } from "../base"
import { Expiration } from "../utils/expiration"

const STORAGE = getWindow()?.localStorage ?? {
  getItem: () => null,
  setItem: toVoid,
  removeItem: toVoid,
}

const syncOverBrowserTabs = (
  observingKey: string,
  onChange: (value: string | null) => void
) =>
  getWindow()?.addEventListener("storage", ({ key, newValue }) => {
    if (observingKey !== key) return
    const currentValue = STORAGE.getItem(observingKey)
    if (currentValue === newValue) return
    onChange(newValue)
  })

export interface ExpirationOptions {
  /** Date at which the value expires */
  expiresAt?: Date | (() => Date)
  /** Milliseconds in which the value expires. Will be ignored if expiresAt is set. */
  expiresIn?: number | (() => number)
}

/** Effect to make an atom value expirable and reset to its defaulValue.
 *
 * __Note:__ When using `expiresAt`, a function returning the date should be prefered since using a static date might end in an infinite loop.
 *
 * @param {ExpirationOptions | undefined} options
 * @param options.expiresAt Date at which the value expires
 * @param options.expiresIn Milliseconds in which the value expires. Will be ignored if expiresAt is set.
 *
 * @returns The effect to be used on atoms.
 **/
export const expiration = createEffect<ExpirationOptions>(
  ({ atom, options = {} }) => {
    const hasExpiration = Boolean(options.expiresAt ?? options.expiresIn)
    if (!hasExpiration) return {}

    const key = CONFIG.name ? `${CONFIG.name}/${atom.name}` : atom.name

    const expiration = new Expiration({
      ...options,
      key: `${key}-expires-at`,
    })

    const reset = () => {
      expiration.remove()
      atom.set(atom.defaultValue)
    }

    return {
      init: () => {
        expiration.init(reset)
        syncOverBrowserTabs(key, () => expiration.init(reset))
      },
      set: ({ value }) => {
        if (value === atom.defaultValue) return
        expiration.set(reset)
      },
    }
  }
)
