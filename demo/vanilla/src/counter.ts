import { applyReduxDevtools, CONFIG } from "@yaasl/devtools"
import { createAtom } from "@yaasl/vanilla"

CONFIG.name = "my-name"

const counter = applyReduxDevtools(createAtom(0, "counter"))
const counter2 = applyReduxDevtools(createAtom(0, "counter2"))
const counter3 = applyReduxDevtools(createAtom(0, "counter3"))

export function setupCounter(element: HTMLButtonElement) {
  const setCounter = (count: number) => {
    counter.set(count)
    counter2.set(count)
    element.innerHTML = `count is ${count}`
  }
  element.addEventListener("click", () => setCounter(counter.get() + 1))
  setCounter(0)
}
