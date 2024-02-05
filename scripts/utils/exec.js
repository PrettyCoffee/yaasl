const { exec: nodeExec } = require("node:child_process")

/**
 *
 * @param {string} command
 * @returns {Promise<string>}
 */
const exec = command =>
  new Promise((resolve, reject) => {
    nodeExec(command, {}, (error, stdout) => {
      if (error) {
        reject(error)
      } else {
        resolve(stdout.trim())
      }
    })
  })

module.exports = { exec }
