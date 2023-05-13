import { name } from "../../package.json"

export const errorMessage = (text: string) => `${text} (${name})`

export const logError = (text: string, value?: unknown) =>
  console.error(errorMessage(text), ...(!value ? [] : ["\n\n", value]))
