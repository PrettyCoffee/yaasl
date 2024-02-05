const { execSync } = require("child_process")

const { log } = require("./log")
const { workspaces } = require("../../package.json")

const getPackages = async () => {
  const packages = workspaces
    .filter(workspace => workspace.startsWith("packages"))
    .map(path => `../../${path}/package.json`)
  return packages.map(require).map(({ name }) => name)
}

const npm = {
  dryRun: false,
  publish: async () => {
    const dry = npm.dryRun ? "--dry-run" : ""
    const packages = await getPackages()

    packages.forEach(workspace => {
      execSync(`npm publish ${dry} --workspace ${workspace}`, {
        stdio: "pipe",
      })
      log.success(`√ Published ${workspace}`)
    })
  },
}

module.exports = { npm }
