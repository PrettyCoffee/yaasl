/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { cache } from "./cache"
import { connectAtom, disconnectAllConnections } from "./connectAtom"
import { Store, store, atom, Atom } from "../../core"
import {
  ConnectionResponse,
  ReduxDevtoolsExtension,
  Message,
} from "../redux-devtools"

const update = (
  connection: ConnectionResponse,
  store: Store,
  atom: Atom,
  value: unknown
) => {
  cache.setAtomValue(store, atom, value)
  connection.send({ type: `SET/${atom.toString()}` }, cache.getStore(store))
}

const mockExtension = () => {
  const initial = undefined as ((Action: Message) => void) | undefined
  const subscription = { current: initial }
  const connection: ConnectionResponse = {
    subscribe: jest.fn(sub => {
      subscription.current = jest.fn(sub)
      return () => null
    }),
    send: jest.fn(),
    init: jest.fn(),
  }

  const extension: ReduxDevtoolsExtension = {
    connect: jest.fn(() => connection),
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
  const testAtom = atom({ defaultValue: value, name: atomName })
  let testStore: Store
  beforeEach(() => {
    const initial = store()
    testStore = { ...initial, set: jest.fn(initial.set) }
    testStore.init(testAtom)
    disconnectAllConnections()
  })

  it("Creates a connection", () => {
    const { connection } = mockExtension()
    connectAtom(connection, testStore, testAtom)

    expect(connection.init).toHaveBeenCalledTimes(1)
    expect(connection.init).toHaveBeenCalledWith({ [atomName]: value })
  })

  it("Returns a function to update the value", () => {
    const { connection } = mockExtension()
    connectAtom(connection, testStore, testAtom)

    update(connection, testStore, testAtom, nextValue)

    expect(connection.send).toHaveBeenCalledTimes(1)
    expect(connection.send).toHaveBeenCalledWith(
      { type: `SET/${atomName}` },
      { [atomName]: nextValue }
    )
  })

  it("Handles multiple atoms", () => {
    const atomName1 = "atomName1"
    const atomName2 = "atomName2"
    const atom1 = atom({ defaultValue: value, name: atomName1 })
    const atom2 = atom({ defaultValue: value, name: atomName2 })
    testStore.init(atom1)
    testStore.init(atom2)

    const { connection } = mockExtension()

    connectAtom(connection, testStore, atom1)
    expect(connection.init).toHaveBeenCalledWith({ [atomName1]: value })

    connectAtom(connection, testStore, atom2)

    expect(connection.init).toHaveBeenCalledTimes(1)
    expect(connection.init).toHaveBeenCalledWith({
      [atomName1]: value,
      [atomName2]: value,
    })

    update(connection, testStore, atom1, nextValue)
    expect(connection.send).toHaveBeenCalledWith(
      { type: `SET/${atomName1}` },
      { [atomName1]: nextValue, [atomName2]: value }
    )

    update(connection, testStore, atom2, nextValue)

    expect(connection.send).toHaveBeenCalledTimes(2)
    expect(connection.send).toHaveBeenLastCalledWith(
      { type: `SET/${atomName2}` },
      { [atomName1]: nextValue, [atomName2]: nextValue }
    )
  })

  describe("Test extension subscription", () => {
    it("Should subscribe", () => {
      const { connection, subscription } = mockExtension()
      connectAtom(connection, testStore, testAtom)

      expect(connection.subscribe).toHaveBeenCalled()
      expect(subscription.current).not.toBeUndefined()
    })

    it("Jumps to a state", () => {
      const { connection, subscription } = mockExtension()
      connectAtom(connection, testStore, testAtom)

      subscription.current?.({
        type: "DISPATCH",
        state: `{ "${atomName}": "${nextValue}" }`,
        payload: { type: "JUMP_TO_ACTION" },
      })

      expect(testStore.get(testAtom)).toBe(nextValue)
    })

    it("Rolls back to a state", () => {
      const { connection, subscription } = mockExtension()
      connectAtom(connection, testStore, testAtom)

      subscription.current?.({
        type: "DISPATCH",
        state: `{ "${atomName}": "${nextValue}" }`,
        payload: { type: "ROLLBACK" },
      })

      expect(testStore.get(testAtom)).toBe(nextValue)
    })

    it("Resets to initial values", () => {
      const { connection, subscription } = mockExtension()
      connectAtom(connection, testStore, testAtom)

      update(connection, testStore, testAtom, nextValue)

      subscription.current?.({
        type: "DISPATCH",
        state: undefined,
        payload: { type: "RESET", timestamp: 0 },
      })

      expect(testStore.get(testAtom)).toBe(value)
    })

    it("Commits the current state", () => {
      const { connection, subscription } = mockExtension()
      connectAtom(connection, testStore, testAtom)
      ;(connection.init as ReturnType<typeof jest.fn>).mockClear()

      update(connection, testStore, testAtom, nextValue)

      subscription.current?.({
        type: "DISPATCH",
        state: undefined,
        payload: { type: "COMMIT", timestamp: 0 },
      })

      expect(testStore.get(testAtom)).toBe(value)
      expect(connection.init).toHaveBeenCalledTimes(1)
      expect(connection.init).toHaveBeenCalledWith({ [atomName]: nextValue })
    })

    it("Imports a history of states", () => {
      const { connection, subscription } = mockExtension()
      connectAtom(connection, testStore, testAtom)

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
        expect(testStore.set).toHaveBeenNthCalledWith(
          index + 1,
          testAtom,
          state[atomName]
        )
      })
    })
  })
})
