export const errorMessage = (text: string) => `${text} (@yaasl/vanilla)`

export const logError = (text: string, value?: unknown) =>
  console.error(errorMessage(text), ...(!value ? [] : ["\n\n", value]))
