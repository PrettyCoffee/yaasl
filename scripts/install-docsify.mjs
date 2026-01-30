import { cp, rm, access } from "fs/promises"
import { basename, resolve } from "path"

import { replaceInFile } from "./utils/replace-in-file.mjs"

const fileInfo = path => {
  const file = basename(path)
  const baseDir = path.split("/")[0]
  const ext = file.match(/\.[0-9a-z]+$/i)[0]
  const min = file.includes(".min") ? ".min" : ""
  const name = file.replace(min + ext, "")
  return { name, baseDir, ext, min }
}

const extend = paths =>
  Promise.all(
    paths.map(async path => {
      const file = fileInfo(path)
      const { default: pkg } = await import(
        `../node_modules/${file.baseDir}/package.json`,
        { with: { type: "json" } }
      )
      const name = `${file.name}@${pkg.version}${file.min}${file.ext}`
      return { path, name }
    })
  )

const styles = await extend(["docsify/lib/themes/pure.css"])

const scripts = await extend([
  //Docsify
  "docsify/lib/docsify.min.js",
  "docsify/lib/plugins/search.min.js",

  //Additional Plugins
  "docsify-copy-code/dist/docsify-copy-code.min.js",
  "docsify-pagination/dist/docsify-pagination.min.js",
  "docsify-tabs/dist/docsify-tabs.min.js",

  //Prism
  "prismjs/components/prism-typescript.min.js",
  "prismjs/components/prism-jsx.min.js",
  "prismjs/components/prism-tsx.min.js",
  "prismjs/components/prism-bash.min.js",
])

const indexHtml = resolve("../docs/index.html")

const deleteLib = async () => {
  const path = "../docs/_lib"
  const exists = await access(path)
    .then(() => true)
    .catch(() => false)
  return exists ? rm("../docs/_lib", { recursive: true }) : Promise.resolve()
}

const copyFiles = () =>
  Promise.all(
    [...styles, ...scripts].map(({ path, name }) =>
      cp(`../node_modules/${path}`, `../docs/_lib/${name}`, {
        force: true,
      })
    )
  )

const insertStyles = () => {
  const stylesHtml = styles
    .map(({ name }) => `<link rel="stylesheet" href="./_lib/${name}" />`)
    .join("\n")

  return replaceInFile(indexHtml, "lib-styles", () => stylesHtml)
}

const insertScripts = () => {
  const scriptsHtml = scripts
    .map(({ name }) => `<script src="./_lib/${name}"></script>`)
    .join("\n")

  return replaceInFile(indexHtml, "lib-scripts", () => scriptsHtml)
}

const copyChangelog = () =>
  cp("../CHANGELOG.md", "../docs/CHANGELOG.md", {
    force: true,
  })

;(async () => {
  await deleteLib()
  await copyFiles()
  console.log("✅ Docsify files were copied to _lib")
  await insertStyles()
  console.log("✅ Added styles to index.html")
  await insertScripts()
  console.log("✅ Added scripts to index.html")
  await copyChangelog()
  console.log("✅ Copied CHANGELOG.md")
})()
