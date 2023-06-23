import { atom, CONFIG, globalStore } from "yaasl/new-core"
import { reduxDevtools } from "yaasl/new-devtools"
import { localStorage } from "yaasl/new-middleware"

CONFIG.name = "yaasl/demo-vanilla"

const counter = atom({name: "counter", defaultValue: 0, middleware: [reduxDevtools(), localStorage({})]})
  
export function setupCounter(element: HTMLButtonElement) {
  globalStore.init(counter)

  const setCounter = (value: number) => {
    globalStore.set(counter, value)
  }

  const updateCounterText = (value: number) =>
    (element.innerHTML = `count is ${value}`)

  globalStore.subscribe(counter, ({ type, value }) => type === "SET" && value && updateCounterText(value))

  element.addEventListener("click", () => setCounter(globalStore.get(counter) + 1))

  updateCounterText(globalStore.get(counter))
}
