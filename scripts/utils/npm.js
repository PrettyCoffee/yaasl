const { execSync } = require("child_process")

const { log } = require("./log")
const { workspaces } = require("../../package.json")

const getPackages = async () => {
  const packages = workspaces
    .filter(workspace => workspace.startsWith("packages"))
    .map(path => `../../${path}/package.json`)
  return packages.map(require).map(({ name }) => name)
}

const publish = async () => {
  const packages = await getPackages()
  packages.forEach(workspace => {
    execSync(`npm publish --workspace ${workspace}`, {
      stdio: "pipe",
    })
    log.success(`√ Published ${workspace}`)
  })
}

module.exports = { npm: { publish } }
