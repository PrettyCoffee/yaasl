import "@redux-devtools/extension"

// This is an INTERNAL type alias.
export interface Message {
  type: string
  payload?: unknown
  state?: unknown
}
