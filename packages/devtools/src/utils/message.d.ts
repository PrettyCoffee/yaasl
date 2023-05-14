type Prettify<T> = {
  [K in keyof T]: T[K]
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {}

interface ImportedAction {
  type: "PERFORM_ACTION"
  timestamp: number
  action: {
    type: string
  }
}

interface ImportAction {
  type: "DISPATCH"
  state: undefined
  payload?: {
    type: "IMPORT_STATE"
    nextLiftedState: {
      computedStates: { state: Record<string, unknown> }[]

      /* Currently not required

      currentStateIndex: number
      nextActionId: number
      stagedActionIds: number[]
      skippedActionIds: number[]
      actionsById: Record<number, ImportedAction>
      */
    }
  }
}

interface StateAction {
  type: "DISPATCH"
  state: string
  payload: {
    type: "JUMP_TO_ACTION" | "ROLLBACK"
    actionId?: number
    timestamp?: number
  }
}

interface StatelessAction {
  type: "DISPATCH"
  state: undefined
  payload: {
    type: "RESET" | "COMMIT"
    timestamp: number
  }
}

interface StartAction {
  type: "START"
  state: undefined
  payload?: {
    type: undefined
  }
}

export type Message = Prettify<
  StartAction | StateAction | StatelessAction | ImportAction
>
