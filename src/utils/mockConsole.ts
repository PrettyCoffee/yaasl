export const mockConsole = () => {
  const oldConsole = global.console
  const error = jest.fn()
  const warn = jest.fn()

  global.console = { ...global.console, error, warn }

  return { error, warn, resetConsole: () => (global.console = oldConsole) }
}
