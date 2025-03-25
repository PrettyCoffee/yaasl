const { readFile, writeFile } = require("node:fs/promises")

const getFileContent = path => readFile(path).then(buffer => String(buffer))

const getIndentation = (file, lineText) => {
  const lines = file.split("\n")
  const target = lines.find(line => line.includes(lineText))
  return target.match(/^(\s*)/)[0]
}

const replaceSection = (file, section, newContent) => {
  const sectionStart = `<!-- >> ${section} >> -->`
  const sectionEnd = `<!-- << ${section} << -->`

  const indentation = getIndentation(file, sectionStart)
  const content = `${sectionStart}\n${newContent}\n${sectionEnd}`.replaceAll(
    "\n",
    `\n${indentation}`
  )

  return file.replace(
    new RegExp(`${sectionStart}.*${sectionEnd}`, "sm"),
    content
  )
}

/** Function to replace a section in a file with new content
 *
 * @param {string} path
 * @param {string} section
 * @param {(prev: string) => string} getContent
 **/
const replaceInFile = async (path, section, getContent) => {
  const file = await getFileContent(path)
  await writeFile(path, replaceSection(file, section, getContent(file)))
}

module.exports = {
  replaceInFile,
}
