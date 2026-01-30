import { color } from "@pretty-cozy/release-tools"

/**
 * @param {string} message
 * @param {{ color: keyof Omit<typeof colors, "reset">, type: "error" | "info" | "warn" }} options
 * */
const logFn = (message, { color: colorArg, type = "info" }) =>
  console[type](color[colorArg](message))

export const log = Object.assign(logFn, {
  /** @param {string} message */
  error: message => logFn(message, { color: "red", type: "error" }),
  /** @param {string} message */
  warn: message => logFn(message, { color: "yellow", type: "warn" }),
  /** @param {string} message */
  info: message => logFn(message, { color: "blue", type: "info" }),
  /** @param {string} message */
  muted: message => logFn(message, { color: "gray", type: "info" }),
  /** @param {string} message */
  success: message => logFn(message, { color: "green", type: "info" }),
})
