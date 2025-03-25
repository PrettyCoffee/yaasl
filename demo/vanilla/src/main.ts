import "./style.css"
import { setupCounter } from "./counter"

const root = document.getElementById("root")
if (!root) throw new Error('Could not find element with id "root"')

root.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="./vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="./typescript.svg" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript + yaasl</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

const counter = document.getElementById("counter")
if (!counter || !(counter instanceof HTMLButtonElement))
  throw new Error('Could not find element with id "counter"')

setupCounter(counter)
