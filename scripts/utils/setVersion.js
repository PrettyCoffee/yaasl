const { setPackageVersion } = require("@pretty-cozy/release-tools")
const { glob } = require("glob")

const getPackages = () =>
  glob(["package.json", "packages/*/package.json"], { absolute: true })

/**
 * @param {string} version
 * @returns {Promise<void>}
 **/
const setVersion = async version => {
  const packagePaths = await getPackages()
  await Promise.all(
    packagePaths.map(path =>
      setPackageVersion({ packagePath: path, version, scope: "@yaasl" })
    )
  )
}

module.exports = { setVersion }
