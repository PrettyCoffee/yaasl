import { Action } from "./Action"

type Prettify<T> = {
  [K in keyof T]: T[K]
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {}

/* Currently not required

interface ImportedAction extends Action<"PERFORM_ACTION"> {
  timestamp: number
  action: {
    type: string
  }
}
*/

type GenericMessage<
  Type extends string,
  State extends string | undefined,
  Payload extends { type?: string } | undefined
> = Action<Type> & {
  state: State
  payload?: Payload
}

type ImportAction = GenericMessage<
  "DISPATCH",
  undefined,
  {
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
>

type StateAction = GenericMessage<
  "DISPATCH",
  string,
  {
    type: "JUMP_TO_ACTION" | "ROLLBACK"
    actionId?: number
    timestamp?: number
  }
>

type StatelessAction = GenericMessage<
  "DISPATCH",
  undefined,
  {
    type: "RESET" | "COMMIT"
    timestamp: number
  }
>

type StartAction = GenericMessage<
  "START",
  undefined,
  | undefined
  | {
      type: undefined
    }
>

export type Message = Prettify<
  StartAction | StateAction | StatelessAction | ImportAction
>
