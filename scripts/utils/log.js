const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
  reset: "\x1b[0m",
}

/**
 * @param {string} message
 * @param {{ color: keyof Omit<typeof colors, "reset">, type: "error" | "info" | "warn" }} options
 * */
const log = (message, { color, type = "info" }) =>
  console[type](`${colors[color]}${message}${colors.reset}`)

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

module.exports = { log: extendedLog }
