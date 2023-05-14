import { createAtom } from "@yaasl/vanilla"

const counter = createAtom(0, "counter")

export function setupCounter(element: HTMLButtonElement) {
  const setCounter = (count: number) => {
    counter.set(count)
    element.innerHTML = `count is ${count}`
  }
  element.addEventListener("click", () => setCounter(counter.get() + 1))
  setCounter(0)
}
