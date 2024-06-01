const { readFile, writeFile } = require("node:fs/promises")

const getFileContent = path => readFile(path).then(buffer => String(buffer))

const replaceSection = (file, section, newContent) => {
  const sectionStart = `<!-- >> ${section} >> -->`
  const sectionEnd = `<!-- << ${section} << -->`
  return file.replace(
    new RegExp(`${sectionStart}.*${sectionEnd}`, "sm"),
    `${sectionStart}\n${newContent}${sectionEnd}`
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
