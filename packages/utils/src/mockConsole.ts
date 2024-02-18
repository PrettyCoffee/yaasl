export const mockConsole = () => {
  const oldConsole = global.console
  const error = vi.fn<unknown[], unknown>()
  const warn = vi.fn<unknown[], unknown>()

  global.console = { ...global.console, error, warn }

  return { error, warn, resetConsole: () => (global.console = oldConsole) }
}
