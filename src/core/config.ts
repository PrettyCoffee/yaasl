interface Config {
  /** Global name to make internal keys unique
   *  among UIs on the same domain.
   *
   *  (e.g. local storage keys look like this if a name is set:
   *  "{config-name}/{atom-name}")
   **/
  name?: string
}

/** Global configuration object to change internal behavior of yaasl.
 *
 *  Values should be set once in your application entrypoint,
 *  before yaasl is being used.
 **/
export const CONFIG: Config = {
  name: undefined,
}
