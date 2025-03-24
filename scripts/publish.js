#!/usr/bin/env node

const { readFile, writeFile } = require("node:fs/promises")

const {
  npm,
  git,
  promptWorkspaces,
  promptVersion,
  createSpinner,
  updateVersions,
} = require("@pretty-cozy/release-tools")
const { prompt } = require("enquirer")

const { createChangelog } = require("./utils/createChangelog")
const { log } = require("./utils/log")

const promptOk = async text => {
  const { ok } = await prompt({
    type: "toggle",
    name: "ok",
    message: text,
    initial: true,
  })

  if (!ok) {
    throw new Error("❌ Cancelled by user")
  }

  return true
}

const spinner = createSpinner()
const newLine = () => log.info("")

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

const updateChangelog = async version => {
  const changelog = await createChangelog(version)
  await appendChangelog(changelog)
  log.muted(`\n# Changelog\n\n${changelog}`)
}

const npmAuth = async () => {
  spinner.start("Checking npm login")
  let user = await npm.whoAmI()
  if (!user) {
    await npm.login({ scope: "@yaasl" })
    user = await npm.whoAmI()
  }
  spinner.step(`Logged in as ${user}`)
  spinner.success("Authentication completed")
}

const prepareRelease = async ({ root, workspaces, version }) => {
  spinner.start("Preparing for release")

  await npm.run("build")
  spinner.step(`Package builds were completed`)

  await updateVersions({ root, workspaces, version })
  await npm.install()
  spinner.step(`Package versions were updated`)

  await git.commit({ message: `chore: Release ${version}` })
  spinner.step(`Committed all changes`)

  await git.tag({ version: version, message: `Release ${version}` })
  spinner.step(`Created git tag ${version}`)

  spinner.success(`Preparation was completed`)
}

const publishVersion = async ({ workspaces, version }) => {
  spinner.start("Pushing changes to github")
  await git.push()
  spinner.step(`Pushed changes`)
  spinner.success("Successfully pushed commits and tags")

  newLine()

  spinner.start(`Publishing selected packages to npm`)
  await npm.publish({
    workspace: workspaces.filter(ws => !ws.ignore).map(ws => ws.name),
    access: "public",
  })
  spinner.success(`Successfully published ${version}`)
}

const run = async () => {
  const version = await promptVersion()
  const { root, workspaces } = await promptWorkspaces()

  if (version.includes("alpha")) {
    await promptOk(`Do you want to release version ${version}?`)
  } else {
    await updateChangelog()
    await promptOk(
      `Do you want to release the above changes with version ${version}?\n  You can edit the changelog before continuing.\n `
    )
  }

  newLine()
  await npmAuth()
  newLine()
  await prepareRelease({ root, workspaces, version })
  newLine()

  await promptOk(`Do you want to push and publish the applied changes?`)
  newLine()
  await publishVersion({ workspaces, version })
  newLine()
}

void run()
