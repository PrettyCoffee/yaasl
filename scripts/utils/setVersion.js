const { writeFile } = require("node:fs/promises")

const { glob } = require("glob")

const getPackages = () =>
  glob(["package.json", "packages/*/package.json"], { absolute: true })

const bumpWorkspaceDeps = (packageJson, version) => {
  const bump = dependencyKey => {
    const current = packageJson[dependencyKey]
    if (!current) return
    packageJson[dependencyKey] = Object.fromEntries(
      Object.entries(current).map(([key, value]) =>
        key.startsWith("@yaasl") ? [key, version] : [key, value]
      )
    )
  }
  bump("dependencies")
  bump("devDependencies")
  bump("peerDependencies")
}

const setPackageVersion = (path, version) => {
  const packageJson = require(path)
  packageJson.version = version
  bumpWorkspaceDeps(packageJson, version)
  return writeFile(path, JSON.stringify(packageJson, null, 2) + "\n")
}

/**
 * @param {string} version
 * @returns {Promise<void>}
 **/
const setVersion = async version => {
  const packagePaths = await getPackages()
  await Promise.all(packagePaths.map(path => setPackageVersion(path, version)))
}

module.exports = { setVersion }
