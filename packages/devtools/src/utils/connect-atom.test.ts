/* eslint-disable @typescript-eslint/no-unsafe-return -- doesn't matter for tests */
import { createAtom, Atom } from "@yaasl/core"
import { vi, it, describe, expect, beforeEach } from "vitest"

import { cache } from "./cache"
import {
  ConnectionResponse,
  ReduxDevtoolsExtension,
  Message,
} from "../get-redux-connection"
import { connectAtom, disconnectAllConnections } from "../redux-devtools"

const update = (
  connection: ConnectionResponse,
  atom: Atom<any>,
  value: unknown
) => {
  cache.setAtomValue(atom, value)
  connection.send({ type: `SET/${atom.name}` }, cache.getStore())
}

const mockExtension = () => {
  const initial = undefined as ((Action: Message) => void) | undefined
  const subscription = { current: initial }
  const connection: ConnectionResponse = {
    subscribe: vi.fn(sub => {
      subscription.current = vi.fn(sub)
      return () => null
    }),
    send: vi.fn(),
    init: vi.fn(),
  }

  const extension: ReduxDevtoolsExtension = {
    connect: vi.fn(() => connection),
    disconnect: () => null,
  }

  window.__REDUX_DEVTOOLS_EXTENSION__ =
    extension as typeof window.__REDUX_DEVTOOLS_EXTENSION__

  return {
    subscription,
    connection,
    extension,
  }
}

const value = "test"
const nextValue = "test 2"
const atomName = "atomName"

describe("Test connectAtom", () => {
  let testAtom = createAtom({ defaultValue: value, name: atomName })
  beforeEach(() => {
    testAtom = createAtom({ defaultValue: value, name: atomName })
    disconnectAllConnections()
  })

  it("Creates a connection", () => {
    const { connection } = mockExtension()
    connectAtom(connection, testAtom)

    expect(connection.init).toHaveBeenCalledTimes(1)
    expect(connection.init).toHaveBeenCalledWith({ [atomName]: value })
  })

  it("Returns a function to update the value", () => {
    const { connection } = mockExtension()
    connectAtom(connection, testAtom)

    update(connection, testAtom, nextValue)

    expect(connection.send).toHaveBeenCalledTimes(1)
    expect(connection.send).toHaveBeenCalledWith(
      { type: `SET/${atomName}` },
      { [atomName]: nextValue }
    )
  })

  it("Handles multiple atoms", () => {
    const atomName1 = "atomName1"
    const atomName2 = "atomName2"
    const atom1 = createAtom({ defaultValue: value, name: atomName1 })
    const atom2 = createAtom({ defaultValue: value, name: atomName2 })

    const { connection } = mockExtension()

    connectAtom(connection, atom1)
    expect(connection.init).toHaveBeenCalledWith({ [atomName1]: value })

    connectAtom(connection, atom2)

    expect(connection.init).toHaveBeenCalledWith({
      [atomName1]: value,
      [atomName2]: value,
    })

    update(connection, atom1, nextValue)
    expect(connection.send).toHaveBeenCalledWith(
      { type: `SET/${atomName1}` },
      { [atomName1]: nextValue, [atomName2]: value }
    )

    update(connection, atom2, nextValue)

    expect(connection.send).toHaveBeenCalledTimes(2)
    expect(connection.send).toHaveBeenLastCalledWith(
      { type: `SET/${atomName2}` },
      { [atomName1]: nextValue, [atomName2]: nextValue }
    )
  })

  describe("Test extension subscription", () => {
    it("Should subscribe", () => {
      const { connection, subscription } = mockExtension()
      connectAtom(connection, testAtom)

      expect(connection.subscribe).toHaveBeenCalled()
      expect(subscription.current).not.toBeUndefined()
    })

    it("Jumps to a state", () => {
      const { connection, subscription } = mockExtension()
      connectAtom(connection, testAtom)

      subscription.current?.({
        type: "DISPATCH",
        state: `{ "${atomName}": "${nextValue}" }`,
        payload: { type: "JUMP_TO_ACTION" },
      })

      expect(testAtom.get()).toBe(nextValue)
    })

    it("Rolls back to a state", () => {
      const { connection, subscription } = mockExtension()
      connectAtom(connection, testAtom)

      subscription.current?.({
        type: "DISPATCH",
        state: `{ "${atomName}": "${nextValue}" }`,
        payload: { type: "ROLLBACK" },
      })

      expect(testAtom.get()).toBe(nextValue)
    })

    it("Resets to initial values", () => {
      const { connection, subscription } = mockExtension()
      connectAtom(connection, testAtom)

      update(connection, testAtom, nextValue)

      subscription.current?.({
        type: "DISPATCH",
        state: undefined,
        payload: { type: "RESET", timestamp: 0 },
      })

      expect(testAtom.get()).toBe(value)
    })

    it("Commits the current state", () => {
      const { connection, subscription } = mockExtension()
      connectAtom(connection, testAtom)
      ;(connection.init as ReturnType<typeof vi.fn>).mockClear()

      update(connection, testAtom, nextValue)

      subscription.current?.({
        type: "DISPATCH",
        state: undefined,
        payload: { type: "COMMIT", timestamp: 0 },
      })

      expect(testAtom.get()).toBe(value)
      expect(connection.init).toHaveBeenCalledTimes(1)
      expect(connection.init).toHaveBeenCalledWith({ [atomName]: nextValue })
    })

    it("Imports a history of states", () => {
      const { connection, subscription } = mockExtension()
      const set = vi.fn()
      testAtom.subscribe(value => set(value))
      connectAtom(connection, testAtom)

      const states = [
        { state: { [atomName]: "1" } },
        { state: { [atomName]: "2" } },
        { state: { [atomName]: "3" } },
      ]

      subscription.current?.({
        type: "DISPATCH",
        state: undefined,
        payload: {
          type: "IMPORT_STATE",
          nextLiftedState: {
            computedStates: states,
          },
        },
      })

      states.forEach(({ state }, index) => {
        expect(set).toHaveBeenNthCalledWith(index + 1, state[atomName])
      })
    })
  })
})
