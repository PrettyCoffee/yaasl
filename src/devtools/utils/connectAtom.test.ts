/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { connectAtom, disconnectAllConnections } from "./connectAtom"
import { Atom, createAtom } from "../../core"
import {
  ConnectionResponse,
  ReduxDevtoolsExtension,
  Message,
} from "../redux-devtools"

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
  let atom: Atom<string>
  beforeEach(() => {
    atom = createAtom(value, atomName)
    disconnectAllConnections()
  })

  it("Creates a connection", () => {
    const { connection } = mockExtension()
    connectAtom(connection, atom as Atom)

    expect(connection.init).toHaveBeenCalledTimes(1)
    expect(connection.init).toHaveBeenCalledWith({ [atomName]: value })
  })

  it("Returns a function to update the value", () => {
    const { connection } = mockExtension()
    const update = connectAtom(connection, atom as Atom)

    update(nextValue)

    expect(connection.send).toHaveBeenCalledTimes(1)
    expect(connection.send).toHaveBeenCalledWith(
      { type: `${atomName}/SET` },
      { [atomName]: nextValue }
    )
  })

  it("Does not init if preventInit is set", () => {
    const { connection } = mockExtension()
    const update = connectAtom(connection, atom as Atom, true)

    expect(connection.init).not.toHaveBeenCalled()

    update(nextValue)

    expect(connection.send).toHaveBeenCalledTimes(1)
    expect(connection.send).toHaveBeenCalledWith(
      { type: `${atomName}/SET` },
      { [atomName]: nextValue }
    )
  })

  it("Handles multiple atoms", () => {
    const atomName1 = "atomName1"
    const atomName2 = "atomName2"
    const atom1 = createAtom(value, atomName1)
    const atom2 = createAtom(value, atomName2)

    const { connection } = mockExtension()

    const update1 = connectAtom(connection, atom1 as Atom)
    expect(connection.init).toHaveBeenCalledWith({ [atomName1]: value })

    const update2 = connectAtom(connection, atom2 as Atom)

    expect(connection.init).toHaveBeenCalledTimes(2)
    expect(connection.init).toHaveBeenCalledWith({
      [atomName1]: value,
      [atomName2]: value,
    })

    update1(nextValue)
    expect(connection.send).toHaveBeenCalledWith(
      { type: `${atomName1}/SET` },
      { [atomName1]: nextValue, [atomName2]: value }
    )

    update2(nextValue)

    expect(connection.send).toHaveBeenCalledTimes(2)
    expect(connection.send).toHaveBeenCalledWith(
      { type: `${atomName2}/SET` },
      { [atomName1]: nextValue, [atomName2]: nextValue }
    )
  })

  describe("Test extension subscription", () => {
    it("Should subscribe", () => {
      const { connection, subscription } = mockExtension()
      connectAtom(connection, atom as Atom)

      expect(connection.subscribe).toHaveBeenCalled()
      expect(subscription.current).not.toBeUndefined()
    })

    it("Jumps to a state", () => {
      const { connection, subscription } = mockExtension()
      connectAtom(connection, atom as Atom)

      subscription.current?.({
        type: "DISPATCH",
        state: `{ "${atomName}": "${nextValue}" }`,
        payload: { type: "JUMP_TO_ACTION" },
      })

      expect(atom.get()).toBe(nextValue)
    })

    it("Rolls back to a state", () => {
      const { connection, subscription } = mockExtension()
      connectAtom(connection, atom as Atom)

      subscription.current?.({
        type: "DISPATCH",
        state: `{ "${atomName}": "${nextValue}" }`,
        payload: { type: "ROLLBACK" },
      })

      expect(atom.get()).toBe(nextValue)
    })

    it("Resets to initial values", () => {
      const { connection, subscription } = mockExtension()
      const update = connectAtom(connection, atom as Atom)

      update(nextValue)

      subscription.current?.({
        type: "DISPATCH",
        state: undefined,
        payload: { type: "RESET", timestamp: 0 },
      })

      expect(atom.get()).toBe(value)
    })

    it("Commits the current state", () => {
      const { connection, subscription } = mockExtension()
      const update = connectAtom(connection, atom as Atom)
      ;(connection.init as ReturnType<typeof jest.fn>).mockClear()

      update(nextValue)

      subscription.current?.({
        type: "DISPATCH",
        state: undefined,
        payload: { type: "COMMIT", timestamp: 0 },
      })

      expect(atom.get()).toBe(value)
      expect(connection.init).toHaveBeenCalledTimes(1)
      expect(connection.init).toHaveBeenCalledWith({ [atomName]: nextValue })
    })

    it("Imports a history of states", () => {
      const { connection, subscription } = mockExtension()
      connectAtom(connection, atom as Atom)

      atom.set = jest.fn(atom.set)

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
        expect(atom.set).toHaveBeenNthCalledWith(index + 1, state[atomName])
      })
    })
  })
})
