import { consoleMessage } from "@yaasl/utils"

import { createEffect } from "./create-effect"
import { Atom } from "../base"

const forceArray = (value: unknown, atom: Atom<any>): unknown[] => {
  if (value == null) return []
  if (Array.isArray(value)) return value
  const message = consoleMessage(
    `Value type is not compatile with the autoSort effect. Value must be an array or nullish.`,
    { scope: atom.name }
  )
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  throw new Error(message + "\nValue: " + String(value))
}

export interface AutoSortOptions<TData> {
  /** Function to sort the atom value. */
  sortFn?: (a: TData, b: TData) => number
}

/** Middleware to automatically sort the atom value.
 *  Only supports arrays and nullish values.
 *
 * @param {AutoSortOptions | undefined} options
 * @param options.sortFn Function to sort the atom value.
 *
 * @returns The effect to be used on atoms.
 **/
export const autoSort = <TData>({ sortFn }: AutoSortOptions<TData>) => {
  const sortEffect = createEffect<
    AutoSortOptions<TData>,
    TData[] | undefined | null
  >({
    sort: "pre",
    init: ({ atom, value, options, set }) => {
      const array = forceArray(value, atom) as TData[]
      set(array.toSorted(options.sortFn))
    },
    set: ({ atom, value, options, set }) => {
      const array = forceArray(value, atom) as TData[]
      set(array.toSorted(options.sortFn))
    },
  })

  return sortEffect({ sortFn })
}
