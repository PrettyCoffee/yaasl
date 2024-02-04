const { readFile, writeFile } = require("node:fs/promises")

const { prompt } = require("enquirer")

const { createChangelog } = require("./utils/createChangelog")
const { git } = require("./utils/git")
const { log } = require("./utils/log")
const { npm } = require("./utils/npm")
const { setVersion } = require("./utils/setVersion")
const { version } = require("./utils/version")

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
const promptVersion = () => {
  return prompt({
    type: "select",
    name: "version",
    message: "Pick a version to release",
    choices: getVersionChoices(),
  }).then(async ({ version }) =>
    version !== "exact" ? version : promptExactVersion()
  )
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

    const changelog = createChangelog(newVersion)
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
  .then(async ({ newVersion, changelog }) => {
    log.info("")
    if (changelog) {
      await appendChangelog(changelog)
      log.success(`√ Changelog was updated`)
    }

    await setVersion(newVersion)
    log.success(`√ Package versions were updated`)

    git.commit(`chore: Release ${newVersion}`)
    log.success(`√ Committed all changes`)

    git.tag(newVersion)
    log.success(`√ Created git tag ${newVersion}`)

    log.info(`\n📦 Publishing all packages to npm...`)
    await npm.publish()

    log.success(`\n🎉 Successfully published ${newVersion}`)
  })
