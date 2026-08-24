/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */

import type { Action, ActionCreator } from "./action"

export interface ExtensionOptions {
  /**
   * The instance name to be showed on the monitor page. Default value is
   * `document.title`. If not specified and there's no document title, it will
   * consist of `tabId` and `instanceId`.
   */
  name?: string
  /** Action creators functions to be available in the Dispatcher. */
  actionCreators?:
    | ActionCreator<unknown>[]
    | Record<string, ActionCreator<unknown>>
  /**
   * If more than one action is dispatched in the indicated interval, all new
   * actions will be collected and sent at once. It is the joint between
   * performance and speed. When set to `0`, all actions will be sent instantly.
   * Set it to a higher value when experiencing perf issues (also `maxAge` to a
   * lower value).
   *
   * @default 500 ms.
   */
  latency?: number
  /**
   * (> 1) - maximum allowed actions to be stored in the history tree. The
   * oldest actions are removed once maxAge is reached. It's critical for
   * performance.
   *
   * @default 50
   */
  maxAge?: number
  /**
   * Function which takes `action` object and id number as arguments, and should
   * return `action` object back.
   */
  actionSanitizer?: <A extends Action>(action: A, id: number) => A
  /**
   * Function which takes `state` object and index as arguments, and should
   * return `state` object back.
   */
  stateSanitizer?: <S>(state: S, index: number) => S
  /**
   * _string or array of strings as regex_ - actions types to be hidden / shown
   * in the monitors (while passed to the reducers). If `actionsAllowlist`
   * specified, `actionsDenylist` is ignored.
   */
  actionsDenylist?: string | string[]
  /**
   * _string or array of strings as regex_ - actions types to be hidden / shown
   * in the monitors (while passed to the reducers). If `actionsAllowlist`
   * specified, `actionsDenylist` is ignored.
   */
  actionsAllowlist?: string | string[]
  /**
   * Called for every action before sending, takes `state` and `action` object,
   * and returns `true` in case it allows sending the current data to the
   * monitor. Use it as a more advanced version of
   * `actionsDenylist`/`actionsAllowlist` parameters.
   */
  predicate?: <S, A extends Action>(state: S, action: A) => boolean
  /**
   * If specified as `false`, it will not record the changes till clicking on
   * `Start recording` button. Available only for Redux enhancer, for others use
   * `autoPause`.
   *
   * @default true
   */
  shouldRecordChanges?: boolean
  /**
   * If specified, whenever clicking on `Pause recording` button and there are
   * actions in the history log, will add this action type. If not specified,
   * will commit when paused. Available only for Redux enhancer.
   *
   * @default "@@PAUSED""
   */
  pauseActionType?: string
  /**
   * Auto pauses when the extension’s window is not opened, and so has zero
   * impact on your app when not in use. Not available for Redux enhancer (as it
   * already does it but storing the data to be sent).
   *
   * @default false
   */
  autoPause?: boolean
  /**
   * If specified as `true`, it will not allow any non-monitor actions to be
   * dispatched till clicking on `Unlock changes` button. Available only for
   * Redux enhancer.
   *
   * @default false
   */
  shouldStartLocked?: boolean
  /**
   * If set to `false`, will not recompute the states on hot reloading (or on
   * replacing the reducers). Available only for Redux enhancer.
   *
   * @default true
   */
  shouldHotReload?: boolean
  /**
   * If specified as `true`, whenever there's an exception in reducers, the
   * monitors will show the error message, and next actions will not be
   * dispatched.
   *
   * @default false
   */
  shouldCatchErrors?: boolean
  /**
   * If you want to restrict the extension, specify the features you allow. If
   * not specified, all of the features are enabled. When set as an object, only
   * those included as `true` will be allowed. Note that except `true`/`false`,
   * `import` and `export` can be set as `custom` (which is by default for Redux
   * enhancer), meaning that the importing/exporting occurs on the client side.
   * Otherwise, you'll get/set the data right from the monitor part.
   */
  features?: {
    /** Start/pause recording of dispatched actions. */
    pause?: boolean
    /** Lock/unlock dispatching actions and side effects. */
    lock?: boolean
    /** Persist states on page reloading. */
    persist?: boolean
    /** Export history of actions in a file. */
    export?: boolean | "custom"
    /** Import history of actions from a file. */
    import?: boolean | "custom"
    /** Jump back and forth (time travelling) */
    jump?: boolean
    /** Skip (cancel) actions. */
    skip?: boolean
    /** Drag and drop actions in the history list. */
    reorder?: boolean
    /** Dispatch custom actions or action creators. */
    dispatch?: boolean
    /** Generate tests for the selected actions. */
    test?: boolean
  }
  /**
   * Set to true or a stacktrace-returning function to record call stack traces
   * for dispatched actions. Defaults to false.
   */
  trace?: boolean | (<A extends Action>(action: A) => string)
  /**
   * The maximum number of stack trace entries to record per action. Defaults to
   * 10.
   */
  traceLimit?: number
}
