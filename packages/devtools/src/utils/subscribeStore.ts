import type { Atom } from "@yaasl/core"

import { cache } from "./cache"
import { updates } from "./updates"
import type { ConnectionResponse } from "../redux-devtools"

let observedAtoms = new Set<Atom>()

const synchronize = (state: Record<string, unknown>) => {
  updates.pause()
  Array.from(observedAtoms).forEach(atom => {
    const atomName = atom.name
    if (!(atomName in state)) return

    const newValue = state[atomName]
    const cachedValue = cache.getAtomValue(atom)
    if (newValue === cachedValue) return

    cache.setAtomValue(atom, newValue)
    atom.set(newValue)
  })
  updates.resume()
}

const getDefaultState = () =>
  Array.from(observedAtoms).reduce<Record<string, unknown>>((result, atom) => {
    result[atom.name] = atom.defaultValue
    return result
  }, {})

let didInit = false
export const subscribeStore = (atom: Atom, connection: ConnectionResponse) => {
  observedAtoms.add(atom)

  if (didInit) return
  didInit = true

  connection.subscribe(action => {
    const { payload, state } = action
    const nextState = !state
      ? null
      : (JSON.parse(state) as Record<string, unknown>)

    switch (payload?.type) {
      case "COMMIT":
        connection.init(cache.getStore())
        break

      case "JUMP_TO_ACTION":
      case "ROLLBACK":
        if (!nextState) return
        synchronize(nextState)
        break

      case "RESET":
        synchronize(getDefaultState())
        connection.send({ type: `RESET_ATOMS` }, cache.getStore())
        break

      case "IMPORT_STATE":
        payload.nextLiftedState.computedStates.forEach(({ state }) => {
          synchronize(state)
          connection.send({ type: `IMPORT_STORE` }, cache.getStore())
        })
        break
    }
  })
}

export const resetSubscriptions = () => {
  didInit = false
  observedAtoms = new Set()
}
