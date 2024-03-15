const { npm } = require("@pretty-cozy/release-tools")

const { workspaces } = require("../../package.json")

const getPackages = async () => {
  const packages = workspaces
    .filter(workspace => workspace.startsWith("packages"))
    .map(path => `../../${path}/package.json`)
  return packages.map(require).map(({ name }) => name)
}

const publishAll = async (onPublish, dryRun) => {
  const packages = await getPackages()

  const promises = packages.map(workspace =>
    npm
      .publish({ workspace, access: "public", dryRun })
      .then(() => onPublish(workspace))
  )
  await Promise.all(promises)
}

module.exports = { publishAll }
