import "@redux-devtools/extension"

import { log } from "./log"

// Original but incomplete type of the redux extension package
type Extension = NonNullable<typeof window.__REDUX_DEVTOOLS_EXTENSION__>

export interface ReduxExtension {
  /** Create a connection to the extension.
   *  This will connect a store (like an atom) to the extension and
   *  display it within the extension tab.
   *
   *  @param options https://github.com/reduxjs/redux-devtools/blob/main/extension/docs/API/Arguments.md
   *  @returns https://github.com/reduxjs/redux-devtools/blob/main/extension/docs/API/Methods.md#connectoptions
   */
  connect: Extension["connect"]

  /** Disconnects all existing connections to the redux extension.
   *  Only use this when you are sure that no other connection exists
   *  or you want to remove all existing connections.
   */
  disconnect?: () => void

  /** Have a look at the documentation for more methods:
   *  https://github.com/reduxjs/redux-devtools/blob/main/extension/docs/API/Methods.md
   */
}

/** Returns the global redux extension object if available */
export const getReduxExtension = (): ReduxExtension | null => {
  const reduxExtension = window.__REDUX_DEVTOOLS_EXTENSION__
  if (!reduxExtension) {
    log.warn("Redux devtools extension was not found")
    return null
  }

  return reduxExtension
}
