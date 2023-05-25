import { createAtom, CONFIG } from "yaasl/core"
import { applyReduxDevtools } from "yaasl/devtools"
import { applyLocalStorage } from "yaasl/middleware"

CONFIG.name = "yaasl/demo-vanilla"

const atom = applyReduxDevtools(createAtom(0, "counter"))
const counter = applyLocalStorage(atom, { key: CONFIG.name + "/counter" })

export function setupCounter(element: HTMLButtonElement) {
  const setCounter = (value: number) => {
    counter.set(value)
  }

  const updateCounterText = (value: number) =>
    (element.innerHTML = `count is ${value}`)

  counter.subscribe(updateCounterText)

  element.addEventListener("click", () => setCounter(counter.get() + 1))

  updateCounterText(counter.get())
}
