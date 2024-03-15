const { color } = require("@pretty-cozy/release-tools")

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
