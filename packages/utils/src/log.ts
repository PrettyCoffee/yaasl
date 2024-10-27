export const consoleMessage = (
  text: string,
  { scope }: { scope?: string } = {}
) => (scope ? `[yaasl][${scope}]: ${text}` : `[yaasl]: ${text}`)

const logger = (type: keyof typeof log, text: string, value?: unknown) =>
  console[type](consoleMessage(text), ...(!value ? [] : ["\n\n", value]))

export const log = {
  warn: (text: string, value?: unknown) => logger("warn", text, value),
  error: (text: string, value?: unknown) => logger("error", text, value),
}
