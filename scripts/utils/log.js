const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
  reset: "\x1b[0m",
}

const color = {
  /** @param {string} message */
  red: message => colors.red + message + colors.reset,
  /** @param {string} message */
  green: message => colors.green + message + colors.reset,
  /** @param {string} message */
  yellow: message => colors.yellow + message + colors.reset,
  /** @param {string} message */
  blue: message => colors.blue + message + colors.reset,
  /** @param {string} message */
  gray: message => colors.gray + message + colors.reset,
}

/**
 * @param {string} message
 * @param {{ color: keyof Omit<typeof colors, "reset">, type: "error" | "info" | "warn" }} options
 * */
const log = (message, { color: colorArg, type = "info" }) =>
  console[type](color[colorArg](message))

const extendedLog = Object.assign(log, {
  /** @param {string} message */
  error: message => log(message, { color: "red", type: "error" }),
  /** @param {string} message */
  warn: message => log(message, { color: "yellow", type: "warn" }),
  /** @param {string} message */
  info: message => log(message, { color: "blue", type: "info" }),
  /** @param {string} message */
  muted: message => log(message, { color: "gray", type: "info" }),
  /** @param {string} message */
  success: message => log(message, { color: "green", type: "info" }),
})

module.exports = { log: extendedLog, color }
