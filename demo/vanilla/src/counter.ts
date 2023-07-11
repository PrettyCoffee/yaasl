import { atom, CONFIG } from "yaasl/core"
import { reduxDevtools } from "yaasl/devtools"
import { localStorage } from "yaasl/middleware"

CONFIG.name = "demo-vanilla"

const counter = atom({
  name: "counter",
  defaultValue: 0,
  middleware: [reduxDevtools(), localStorage()]
})
  
export function setupCounter(element: HTMLButtonElement) {
  const updateCounterText = (value: number) =>
    (element.innerHTML = `count is ${value}`)

    counter.subscribe((value) => value && updateCounterText(value))

  element.addEventListener("click", () => counter.set((previous) => previous + 1))

  updateCounterText(counter.snapshot())
}
