const { exec } = require("./exec")

const removeCommitHash = commit => commit.replace(/^[a-f0-9]+ /, "")

const git = {
  dryRun: false,
  /**
   * @param {string} version
   * @returns {Promise<void>}
   */
  commit: async message => {
    await exec(`git add -A`)
    const dry = git.dryRun ? "--dry-run --allow-empty" : ""
    await exec(`git commit ${dry} -m "${message}"`)
  },
  /**
   * @param {string} version
   * @returns {Promise<void>}
   */
  tag: async version => {
    if (git.dryRun) return
    await exec(`git tag ${version}`)
  },
  /**
   * @returns {Promise<string>}
   */
  latestTag: () => exec(`git describe --tags --abbrev=0`),
  /**
   * @returns {Promise<string[]>}
   */
  allTags: () =>
    exec(`git tag -l --sort=version:refname`).then(tags =>
      tags
        .split("\n")
        // Ignore tags with extensions
        .filter(version => /^\d+\.\d+\.\d+$/.test(version))
    ),
  /**
   * @param {string | undefined} startTag
   * @param {string | undefined} endTag
   * @returns {Promise<string[]>}
   **/
  getCommits: async (startTag, endTag) => {
    const tags = await git.allTags()
    const start = startTag ?? tags.at(-1)
    const end = endTag ?? "HEAD"

    const command = `git log ${start}..${end} --oneline`
    return exec(command).then(commits =>
      commits.split("\n").filter(Boolean).map(removeCommitHash)
    )
  },
}

module.exports = { git }
