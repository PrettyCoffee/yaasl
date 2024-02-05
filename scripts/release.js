const { readFile, writeFile } = require("node:fs/promises")

const { prompt } = require("enquirer")

const { createChangelog } = require("./utils/createChangelog")
const { git } = require("./utils/git")
const { log } = require("./utils/log")
const { npm } = require("./utils/npm")
const { setVersion } = require("./utils/setVersion")
const { spinner } = require("./utils/spinner")
const { version } = require("./utils/version")

const args = process.argv.slice(2)

const dryRun = args.includes("--dry-run")

git.dryRun = dryRun
npm.dryRun = dryRun

if (dryRun) {
  log.warn("Dry run enabled, only changelog will be updated")
}

/** @returns {Promise<string>} */
const promptExactVersion = () =>
  prompt({
    type: "input",
    name: "version",
    message: "Enter a version",
    initial: version.current.full,
    validate: value => (version.isValid(value) ? true : "Format must be x.x.x"),
  }).then(({ version }) => version)

const getVersionChoices = () => {
  const exact = { message: "exact", value: "exact", hint: "x.x.x" }

  const { extension } = version.current
  if (extension) {
    const current = version.getNext("current")
    const extensionBump = version.getNext("extension")

    return [
      {
        message: "release",
        value: current,
        hint: `${current} (remove ${extension})`,
      },
      {
        message: `bump ${extension}`,
        value: extensionBump,
        hint: extensionBump,
      },
      exact,
    ]
  }

  const nextMajor = version.getNext("major")
  const nextMinor = version.getNext("minor")
  const nextPatch = version.getNext("patch")

  return [
    { message: "major", value: nextMajor, hint: nextMajor },
    { message: "minor", value: nextMinor, hint: nextMinor },
    { message: "patch", value: nextPatch, hint: nextPatch },
    exact,
  ]
}

/** @returns {Promise<string>} */
const promptVersion = async () => {
  const { version } = await prompt({
    type: "select",
    name: "version",
    message: "Pick a version to release",
    choices: getVersionChoices(),
  })

  return version !== "exact" ? version : promptExactVersion()
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

const spin = spinner()

promptVersion()
  .then(async newVersion => {
    if (version.parse(newVersion).extension) {
      const { ok } = await prompt({
        type: "toggle",
        name: "ok",
        message: `Do you want to release version ${newVersion}?`,
        initial: true,
      })

      if (!ok) {
        throw new Error("Cancelled by user")
      }

      return { newVersion }
    }

    const changelog = await createChangelog(newVersion)
    log.muted(`\n# Changelog\n\n${changelog}`)

    const { ok } = await prompt({
      type: "toggle",
      name: "ok",
      message: `Do you want to release the above changes with version ${newVersion}?`,
      initial: true,
    })

    if (!ok) {
      throw new Error("Cancelled by user")
    }

    return { newVersion, changelog }
  })
  .then(async payload => {
    log.info("")

    spin.start("Checking npm login")
    let user = await npm.whoAmI()
    if (!user) {
      await npm.login()
      user = await npm.whoAmI()
    }
    spin.step(`Logged in as ${user}`)
    spin.success("Authentication completed")

    return payload
  })
  .then(async ({ newVersion, changelog }) => {
    log.info("")

    spin.start("Preparing for release")
    if (changelog) {
      await appendChangelog(changelog)
      spin.step("Changelog was updated")
    }

    if (!dryRun) {
      await setVersion(newVersion)
    }
    spin.step(`Package versions were updated`)

    await git.commit(`chore: Release ${newVersion}`)
    spin.step(`Committed all changes`)

    await git.tag(newVersion)
    spin.step(`Created git tag ${newVersion}`)

    spin.success(`Preparation was completed`)
    return newVersion
  })
  .then(async newVersion => {
    log.info("")

    spin.start(`Publishing all packages to npm`)
    await npm.publish(async workspace => {
      spin.step(`Published ${workspace}`)
    })
    spin.success(`Successfully published ${newVersion}`)

    log.info("")
  })
