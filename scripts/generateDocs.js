const { execSync } = require("node:child_process")
const { readdir, readFile, writeFile } = require("node:fs/promises")
const { resolve } = require("node:path")

const TOC_START = "<!-- >> TOC >> -->"
const TOC_END = "<!-- << TOC << -->"

const rootDir = resolve(__dirname, "../")
const docsDir = resolve(rootDir, "./docs")

const getFile = path =>
  readFile(path).then(buffer => ({ path, content: String(buffer) }))

const getFiles = () =>
  readdir(docsDir)
    .then(list => [
      resolve(rootDir, "README.md"),
      ...list.map(file => resolve(docsDir, file)),
    ])
    .then(files => Promise.all(files.map(getFile)))

const parseHeadline = headline => {
  const [level, text] = /(#+)\s*(.*)/g.exec(headline).slice(1, 3)
  return {
    level: level.length,
    text,
  }
}

const getHeadlines = text =>
  text
    .split("\n")
    .map(line => line.match(/^#+\s*.*$/))
    .filter(Boolean)
    .map(parseHeadline)

const getHeadlineLink = (text, link) =>
  `[${text}](#${link.replaceAll(" ", "-").toLowerCase()})`

const groupHeadlines = headlines => {
  const usedHeadlines = []

  const getUniqueLink = text => {
    const existing = usedHeadlines.filter(headline => headline === text).length
    usedHeadlines.push(text)
    return getHeadlineLink(text, existing === 0 ? text : `${text}-${existing}`)
  }

  return headlines.reduce((result, { level, text }) => {
    const link = getUniqueLink(text)
    switch (level) {
      case 1:
        result.push({ level, text, link })
        break
      case 2:
        result.push({ level, text, link, sublines: [] })
        break
      case 3:
        result[result.length - 1].sublines.push(link)
        break
    }
    return result
  }, [])
}

const createToc = text => {
  const headlines = getHeadlines(text)
  return groupHeadlines(headlines).reduce(
    (result, { level, sublines, link }) => {
      if (level === 1) return result + `- ${link}\n`
      const rest = sublines?.length > 0 ? sublines.join(", ") : undefined

      return rest
        ? result + `  - ${link} [ ${rest} ]\n`
        : result + `  - ${link}\n`
    },
    ""
  )
}

const replaceToc = (text, toc) =>
  text.replace(
    new RegExp(`${TOC_START}.*${TOC_END}`, "sm"),
    `${TOC_START}\n${toc}${TOC_END}`
  )

const formatFiles = () => {
  execSync(
    "prettier **.md --arrow-parens=avoid --no-semi --single-quote=false --tab-width=2 --write",
    { stdio: "inherit" }
  )
}

getFiles()
  .then(files =>
    files.map(file => ({
      ...file,
      content: replaceToc(file.content, createToc(file.content)),
    }))
  )
  .then(files =>
    Promise.all(files.map(({ path, content }) => writeFile(path, content)))
  )
  .then(formatFiles)
