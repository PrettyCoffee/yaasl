const { version: currentVersion } = require("../../package.json")

/** Regex for semantic versions
 *  examples: 1.0.0, 1.0.0-alpha.1, 1.0.0-rc.1
 */
const semanticVersion = /^(\d+)\.(\d+)\.(\d+)(?:-([a-z]+)\.(\d+))?$/

/**
 * @param {string} version
 * @returns {boolean}
 **/
const isValid = version => semanticVersion.test(version)

/** @typedef {{ major: number, minor: number, patch: number, extension: string | undefined, extensionVersion: number | undefined, full: string }} Version */
/**
 * @param {string} version
 * @returns {Version}
 **/
const parse = version => {
  const [major, minor, patch, extension, extensionVersion] = semanticVersion
    .exec(version)
    .slice(1)
  return {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    extension,
    extensionVersion: Number(extensionVersion),
    full: version,
  }
}

const current = parse(currentVersion)
const { major, minor, patch, extension, extensionVersion } = current

/**
 * @param {"current" | "major" | "minor" | "patch" | "extension"} change
 * @returns {string}
 **/
const getNext = change => {
  switch (change) {
    case "current":
      return `${major}.${minor}.${patch}`
    case "major":
      return `${major + 1}.0.0`
    case "minor":
      return `${major}.${minor + 1}.0`
    case "patch":
      return `${major}.${minor}.${patch + 1}`
    case "extension":
      return `${major}.${minor}.${patch}-${extension}.${extensionVersion + 1}`
    default:
      throw new Error(`Invalid arg in version.getNext: ${change}`)
  }
}

module.exports = {
  version: {
    getNext,
    isValid,
    parse,
    current,
  },
}
