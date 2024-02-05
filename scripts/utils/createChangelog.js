const { git } = require("./git")

const commitRegex = /^([a-z]+)(?:\((.+)\))?(!)?:\s*(.+)/

const types = ["fix", "feat"]

const isChangeCommit = commit => types.includes(commit.type)
const isNotInternal = commit => commit.scope !== "internal"

/** @param {string} commit */
const parseCommit = commit => {
  const [, type, scope, breaking, message] = commitRegex.exec(commit) ?? []
  return { type, scope, breaking: !!breaking, message, full: commit }
}

const sortCommits = (a, b) => {
  const scopeDiff = (a.scope ?? "").localeCompare(b.scope ?? "")
  if (scopeDiff !== 0) {
    return a.scope == null ? -1 : b.scope == null ? 1 : scopeDiff
  }

  return a.message.localeCompare(b.message)
}

const printCommit = commit => {
  const content = commit.scope
    ? `[${commit.scope}]: ${commit.message}`
    : `${commit.message}`
  return `- ${content}\n`
}

const getToday = () => new Date().toISOString().split("T")[0]

const printChangelog = (version, commits) => {
  let result = `## ${version} (${getToday()})\n`

  if (commits.length === 0) {
    result += "\nNo changes\n"
    return result
  }

  const { breaking, feat, fix } = commits.reduce(
    (acc, commit) => {
      if (commit.breaking) {
        acc.breaking.push(commit)
      } else {
        acc[commit.type]?.push(commit)
      }
      return acc
    },
    { breaking: [], feat: [], fix: [] }
  )

  if (breaking.length) {
    result += "\n### Breaking Changes\n\n"
    breaking.forEach(commit => (result += printCommit(commit)))
  }

  if (feat.length) {
    result += "\n### Features\n\n"
    feat.forEach(commit => (result += printCommit(commit)))
  }

  if (fix.length) {
    result += "\n### Bug Fixes\n\n"
    fix.forEach(commit => (result += printCommit(commit)))
  }

  return result
}

const createChangelog = async version =>
  git
    .getCommits()
    .then(commits =>
      commits
        .map(parseCommit)
        .filter(isChangeCommit)
        .filter(isNotInternal)
        .sort(sortCommits)
    )
    .then(commits => printChangelog(version, commits))

module.exports = { createChangelog }
