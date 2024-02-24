const { exec } = require("./exec")
const { workspaces } = require("../../package.json")

const getPackages = async () => {
  const packages = workspaces
    .filter(workspace => workspace.startsWith("packages"))
    .map(path => `../../${path}/package.json`)
  return packages.map(require).map(({ name }) => name)
}

const npm = {
  dryRun: false,
  whoAmI: () => {
    try {
      return exec(`npm whoami`)
    } catch {
      return Promise.resolve(null)
    }
  },
  login: async () => {
    await exec(`npm login --scope=@yaasl`)
  },
  install: async () => {
    await exec(`npm i`)
  },
  publish: async onPublish => {
    const dry = npm.dryRun ? "--dry-run" : ""
    const packages = await getPackages()

    const promises = packages.map(workspace =>
      exec(`npm publish ${dry} --workspace ${workspace} --access=public`).then(
        () => onPublish(workspace)
      )
    )
    await Promise.all(promises)
  },
}

module.exports = { npm }
