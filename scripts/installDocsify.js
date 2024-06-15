const { cp, rm } = require("fs/promises")
const { basename, resolve } = require("path")

const { replaceInFile } = require("./utils/replaceInFile")

const styles = ["docsify/lib/themes/pure.css"]

const scripts = [
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
]

const fileInfo = path => {
  const file = basename(path)
  const baseDir = path.split("/")[0]
  const ext = file.match(/\.[0-9a-z]+$/i)[0]
  const min = file.includes(".min") ? ".min" : ""
  const name = file.replace(min + ext, "")
  return { name, baseDir, ext, min }
}

const getName = path => {
  const { name, baseDir, min, ext } = fileInfo(path)
  const { version } = require(`../node_modules/${baseDir}/package.json`)
  return `${name}@${version}${min}${ext}`
}

const indexHtml = resolve("../docs/index.html")

const deleteLib = () => rm("../docs/_lib", { recursive: true })

const copyFiles = () =>
  Promise.all(
    [...styles, ...scripts].map(script =>
      cp(`../node_modules/${script}`, `../docs/_lib/${getName(script)}`, {
        force: true,
      })
    )
  )

const insertStyles = () => {
  const stylesHtml = styles
    .map(script => `<link rel="stylesheet" href="./_lib/${getName(script)}" />`)
    .join("\n")

  return replaceInFile(indexHtml, "lib-styles", () => stylesHtml)
}

const insertScripts = () => {
  const scriptsHtml = scripts
    .map(script => `<script src="./_lib/${getName(script)}"></script>`)
    .join("\n")

  return replaceInFile(indexHtml, "lib-scripts", () => scriptsHtml)
}

;(async () => {
  await deleteLib()
  await copyFiles()
  console.log("✅ Docsify files were copied to _lib")
  await insertStyles()
  console.log("✅ Added styles to index.html")
  await insertScripts()
  console.log("✅ Added scripts to index.html")
})()
