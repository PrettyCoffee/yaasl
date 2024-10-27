import type { Action } from "./Action"
import { getReduxExtension } from "./getReduxExtension"
import type { Message } from "./Message"

export interface ConnectionResponse {
  /** Initiate the connection and add it to the extension connections.
   *  Should only be executed once in the live time of the connection.
   */
  init: (state: unknown) => void

  /** Send a new action to the connection to display the state change in the extension.
   *  For example when the value of the store changes.
   */
  send: (action: Action, state: unknown) => void

  /** Add a subscription to the connection.
   *  The provided listener will be executed when the user interacts with the extension
   *  with actions like time traveling, importing a state or the likes.
   *
   *  @param listener function to be executed when an action is submitted
   *  @returns function to unsubscribe the applied listener
   */
  subscribe: (listener: (message: Message) => void) => (() => void) | undefined
}

const connections: Record<string, ConnectionResponse> = {}

/** Wrapper to create a new or get the existing connection to the redux extension
 *  Connections are used to display the stores value and value changes within the extension
 *  as well as reacting to extension actions like time traveling.
 **/
export const getReduxConnection = (name: string) => {
  const existing = connections[name]
  if (existing) return existing

  const extension = getReduxExtension()
  if (!extension) return null

  connections[name] = extension.connect({ name })
  return connections[name]
}
