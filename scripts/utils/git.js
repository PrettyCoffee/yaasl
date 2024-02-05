const { execSync } = require("node:child_process")

const removeCommitHash = commit => commit.replace(/^[a-f0-9]+ /, "")

const git = {
  dryRun: false,
  /**
   * @param {string} version
   * @returns {void}
   */
  commit: message => {
    execSync(`git add -A`, { stdio: "pipe" })
    const dry = git.dryRun ? "--dry-run" : ""
    execSync(`git commit ${dry} -m "${message}"`, { stdio: "pipe" })
  },
  /**
   * @param {string} version
   * @returns {void}
   */
  tag: version => {
    if (git.dryRun) return
    execSync(`git tag ${version}`, { stdio: "pipe" })
  },
  /**
   * @returns {string}
   */
  latestTag: () =>
    execSync(`git describe --tags --abbrev=0`, { stdio: "pipe" })
      .toString()
      .trim(),
  /**
   * @returns {string[]}
   */
  allTags: () =>
    execSync(`git tag -l --sort=version:refname`, { stdio: "pipe" })
      .toString()
      .trim()
      .split("\n")
      // Ignore tags with extensions
      .filter(version => /^\d+\.\d+\.\d+$/.test(version)),
  /**
   * @param {string | undefined} startTag
   * @param {string | undefined} endTag
   * @returns {string[]}
   **/
  getCommits: (startTag, endTag) => {
    const start = startTag ?? git.allTags().at(-1)
    const end = endTag ?? "HEAD"
    const command = `git log ${start}..${end} --oneline`
    return execSync(command, { stdio: "pipe" })
      .toString()
      .trim()
      .split("\n")
      .filter(Boolean)
      .map(removeCommitHash)
  },
}

module.exports = { git }
