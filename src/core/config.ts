interface Config {
  /** Global name to make internal keys unique
   *  among UIs on the same domain.
   *
   *  (e.g. local storage keys look like this if a name is set:
   *  "{config-name}/{atom-name}")
   **/
  name?: string
}

/**
 * Global configuration object to change internal behavior of yaasl.
 */
export const CONFIG: Config = {
  name: undefined,
}
