import { ReduxExtension, getReduxExtension } from "./getReduxExtension"
import { Message } from "../types"

// Original but incomplete type of the redux extension package
type ConnectResponse = ReturnType<NonNullable<ReduxExtension>["connect"]>

export interface Connection {
  /** Initiate the connection and add it to the extension connections.
   *  Should only be executed once in the live time of the connection.
   */
  init: ConnectResponse["init"]

  /** Add a subscription to the connection.
   *  The provided listener will be executed when the user interacts with the extension
   *  with actions like time traveling, importing a state or the likes.
   *
   *  @param listener function to be executed when an action is submitted
   *  @returns function to unsubscribe the applied listener
   */
  subscribe: (listener: (message: Message) => void) => (() => void) | undefined

  /** Send a new action to the connection to display the state change in the extension.
   *  For example when the value of the store changes.
   */
  send: ConnectResponse["send"]
}

let connection: Connection | null = null

/** Wrapper to create a new or get the existing connection to the redux extension
 *  Connections are used to display the stores value and value changes within the extension
 *  as well as reacting to extension actions like time traveling.
 **/
export const getReduxConnection = (name: string) => {
  if (connection) return connection

  const extension = getReduxExtension()
  if (!extension) return null

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  connection = extension.connect({ name }) as Connection
  return connection
}
