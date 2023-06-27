import { PropsWithChildren, createContext, useContext } from "react"

import { Store, globalStore, store as createStore } from "../core"

const Context = createContext(globalStore)
Context.displayName = "YaaslStoreContext"

export interface StoreProviderProps {
  /** Store to be provided to yaasl atom hooks */
  store?: Store
}

/**
 * Provide a store to atom hooks. (e.g. useAtom)
 **/
export const StoreProvider = ({
  children,
  store = createStore(),
}: PropsWithChildren<StoreProviderProps>) => (
  <Context.Provider value={store}>{children}</Context.Provider>
)

export const useStoreProvider = () => useContext(Context)
