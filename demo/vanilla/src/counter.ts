import { atom, CONFIG, reduxDevtools, localStorage, indexedDb, expiration } from "yaasl"

CONFIG.name = "demo-vanilla"

const counter = atom({
  name: "counter",
  defaultValue: 0,
  middleware: [localStorage(), indexedDb(), expiration({ expiresIn: 5000 }),  reduxDevtools() ],
})

export function setupCounter(element: HTMLButtonElement) {
  const updateCounterText = (value: number) =>
    (element.innerHTML = `count is ${value}`)

  element.addEventListener("click", () => counter.set(previous => previous + 1))

  counter.subscribe(value => updateCounterText(value))

  updateCounterText(counter.get())
}
