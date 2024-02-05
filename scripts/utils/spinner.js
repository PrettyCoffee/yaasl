const { color } = require("./log")

const getLineWidth = () => process.stdout.getWindowSize()[0]

/** @param {string} text */
// eslint-disable-next-line no-unused-vars -- keep that for now
const truncate = text => {
  const width = getLineWidth()
  if (text.length <= width) {
    return text
  }
  return text.substring(0, width - 3) + "..."
}

/**
 * @param {string} text
 * @param {boolean} resetLine
 */
const writeLine = (text, resetLine = false) => {
  process.stdout.cursorTo(0)
  process.stdout.write(text)
  process.stdout.clearLine(1)
  if (resetLine) {
    process.stdout.write("\r")
  } else {
    process.stdout.write("\n")
  }
}

const cursor = {
  isHidden: false,
  show: () => {
    if (!cursor.isHidden) return
    cursor.isHidden = false
    process.stdout.write("\u001B[?25h")
  },
  hide: () => {
    if (cursor.isHidden) return
    cursor.isHidden = true
    process.stdout.write("\u001B[?25l")
  },
}

const userInput = {
  isBlocked: false,
  enable: () => {
    if (!userInput.isBlocked) return
    userInput.isBlocked = false
    process.stdin.setRawMode(true)
  },
  disable: () => {
    if (userInput.isBlocked) return
    userInput.isBlocked = true
    process.stdin.setRawMode(false)
  },
}

const spinner = () => {
  let intervalId = null
  let current = 0
  let curentStep = 0
  let text = ""
  let frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]

  const update = () => {
    const frame = frames[current++ % frames.length]
    const line = `${color.blue(frame)} ${text}`

    writeLine(line, true)
  }

  /** @param {string} newText */
  const setText = newText => {
    text = newText
  }

  /** @param {string} text */
  const start = text => {
    if (intervalId) {
      throw new Error("Spinner is already running")
    }

    setText(text)
    cursor.hide()
    userInput.disable()
    intervalId = setInterval(update, 50)
  }

  const reset = () => {
    clearInterval(intervalId)
    intervalId = null
    current = 0
    curentStep = 0
    setText("")
    cursor.show()
    userInput.enable()
  }

  /** @param {string} text */
  const stop = text => {
    if (!intervalId) return

    if (curentStep > 0) {
      writeLine(`${color.gray("└─")}${text}`)
    } else {
      writeLine(text)
    }
    reset()
  }

  /** @param {string} text */
  const success = text => {
    stop(`${color.green("√")} ${text}`)
  }

  /** @param {string} text */
  const error = text => {
    stop(`${color.red("✖")} ${text}`)
  }

  /** @param {string} text */
  const step = text => {
    curentStep++
    if (curentStep === 1) {
      writeLine(`${color.gray("┌─»")} ${text}`)
    } else {
      writeLine(`${color.gray("├─»")} ${text}`)
    }
  }

  return { start, setText, success, error, step }
}

module.exports = { spinner }
