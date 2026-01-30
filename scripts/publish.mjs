import { readFile, writeFile } from "node:fs/promises"

import {
  npm,
  git,
  promptWorkspaces,
  promptVersions,
  createSpinner,
  promptOk,
  updateVersion,
} from "@pretty-cozy/release-tools"

import { createChangelog } from "./utils/create-changelog.mjs"
import { log } from "./utils/log.mjs"

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
  const changelog = await createChangelog({ version })
  await appendChangelog(changelog)
  log.muted(`\n# Changelog\n\n${changelog}`)
}

const prepareRelease = async ({ root, workspaces, version }) => {
  spinner.start("Preparing for release")

  await npm.run("build")
  spinner.step(`Package builds were completed`)

  for (const ws of [root, ...workspaces]) {
    if (ws.ignore) continue
    await updateVersion({
      name: ws.name,
      version,
      root,
      workspaces,
    })
  }
  await npm.install()
  spinner.step(`Package versions were updated`)

  await git.commit({ message: `chore: Release ${version}` })
  spinner.step(`Committed all changes`)

  await git.tag({ version, message: `Release ${version}` })
  spinner.step(`Created git tag ${version}`)

  spinner.success(`Preparation was completed`)
}

const releaseChanges = async () => {
  spinner.start("Pushing changes to github")

  await git.push()
  spinner.step(`Pushed commits`)

  await git.push({ tags: true })
  spinner.step(`Pushed tags`)

  spinner.success("Successfully pushed commits and tags")
  newLine()
}

const run = async () => {
  const { root, workspaces } = await promptWorkspaces({
    enforceRootSelected: true,
  })
  if (root.ignore) {
    log.error("❌ Root package must be selected")
    process.exit(1)
  }
  const { [root.name]: version } = await promptVersions({
    root,
    workspaces: [],
  })

  let ok = false
  if (version.includes("alpha")) {
    ok = await promptOk(`Do you want to release version ${version}?`)
  } else {
    await updateChangelog(version)
    ok = await promptOk(
      `Do you want to release the above changes with version ${version}?\n  You can edit the changelog before continuing.\n `
    )
  }
  if (!ok) {
    log.error("❌ Cancelled by user")
    process.exit(1)
  }

  newLine()
  await prepareRelease({ root, workspaces, version })
  newLine()

  ok = await promptOk(`Do you want to push and publish the applied changes?`)
  if (!ok) {
    log.error("❌ Cancelled by user")
    process.exit(1)
  }
  newLine()
  releaseChanges({ version, workspaces })
  newLine()
}

void run()
