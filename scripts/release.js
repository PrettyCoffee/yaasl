const { readFile, writeFile } = require("node:fs/promises")

const {
  git,
  npm,
  promptVersion,
  createSpinner,
  Version,
} = require("@pretty-cozy/release-tools")
const { prompt } = require("enquirer")

const { createChangelog } = require("./utils/createChangelog")
const { log } = require("./utils/log")
const { publishAll } = require("./utils/publishAll")
const { setVersion } = require("./utils/setVersion")
const { version: currentVersion } = require("../package.json")

const args = process.argv.slice(2)

const dryRun = args.includes("--dry-run")

if (dryRun) {
  log.warn("Dry run enabled, only changelog will be updated")
}

const promptContinue = async text => {
  const { ok } = await prompt({
    type: "toggle",
    name: "ok",
    message: text,
    initial: true,
  })

  if (!ok) {
    throw new Error("Cancelled by user")
  }

  return true
}

const appendChangelog = async changes => {
  const changelog = await readFile("CHANGELOG.md", "utf-8")
  const newChangelog = changelog.replace(
    "# Changelog\n\n",
    "# Changelog\n\n" + changes + "\n"
  )
  if (newChangelog !== changelog) {
    await writeFile("CHANGELOG.md", newChangelog)
  } else {
    throw new Error("Something went wrong while appending the changelog")
  }
}

const spinner = createSpinner()

promptVersion(currentVersion)
  .then(async newVersion => {
    if (Version.parse(newVersion).extension) {
      await promptContinue(`Do you want to release version ${newVersion}?`)
      return { newVersion }
    }

    const changelog = await createChangelog(newVersion)
    await appendChangelog(changelog)
    log.muted(`\n# Changelog\n\n${changelog}`)

    await promptContinue(
      `Do you want to release the above changes with version ${newVersion}?\n  You can edit the changelog before continuing.\n `
    )

    return { newVersion }
  })
  .then(async payload => {
    log.info("")

    spinner.start("Checking npm login")
    let user = await npm.whoAmI()
    if (!user) {
      await npm.login({ scope: "@yaasl" })
      user = await npm.whoAmI()
    }
    spinner.step(`Logged in as ${user}`)
    spinner.success("Authentication completed")

    return payload
  })
  .then(async ({ newVersion }) => {
    log.info("")

    spinner.start("Preparing for release")
    await npm.run("build")
    spinner.step(`Package builds were completed`)

    if (!dryRun) {
      await setVersion(newVersion)
      await npm.install()
    }
    spinner.step(`Package versions were updated`)

    await git.commit({ message: `chore: Release ${newVersion}`, dryRun })
    spinner.step(`Committed all changes`)

    await git.tag({
      version: newVersion,
      message: `Release ${newVersion}`,
      dryRun,
    })
    spinner.step(`Created git tag ${newVersion}`)

    spinner.success(`Preparation was completed`)
    return newVersion
  })
  .then(async newVersion => {
    log.info("")
    await promptContinue(`Do you want to push and publish the applied changes?`)
    log.info("")

    spinner.start("Pushing changes to github")
    await git.push({ dryRun })
    spinner.step(`Pushed changes`)
    spinner.success("Successfully pushed commits and tags")

    log.info("")

    spinner.start(`Publishing all packages to npm`)
    await publishAll(workspace => {
      spinner.step(`Published ${workspace}`)
    }, dryRun)
    spinner.success(`Successfully published ${newVersion}`)

    log.info("")
  })
