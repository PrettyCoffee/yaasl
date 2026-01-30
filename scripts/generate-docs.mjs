import { execSync } from "node:child_process"
import { resolve } from "node:path"

import { replaceInFile } from "./utils/replace-in-file.mjs"

const rootDir = resolve(__dirname, "../")

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
  `[${text}](#${link
    .replaceAll(/[()]+/gi, "")
    .replaceAll(" ", "-")
    .toLowerCase()})`

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

const formatFiles = () => {
  execSync(
    "prettier **.md --arrow-parens=avoid --no-semi --single-quote=false --tab-width=2 --write",
    { stdio: "inherit" }
  )
}

const readme = resolve(rootDir, "README.md")
replaceInFile(readme, "TOC", createToc).then(formatFiles)
