import preactLogo from "./assets/preact.svg"
import viteLogo from "./assets/vite.svg"
import { Counter } from "./Counter.tsx"
import "./App.css"

export const App = () => (
  <>
    <div>
      <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
        <img src={viteLogo} className="logo" alt="Vite logo" />
      </a>
      <a href="https://preactjs.com/" target="_blank" rel="noreferrer">
        <img src={preactLogo} className="logo preact" alt="Preact logo" />
      </a>
    </div>
    <h1>Vite + Preact + yaasl</h1>
    <div className="card">
      <Counter />
    </div>
    <p className="read-the-docs">
      Click on the Vite and Preact logos to learn more
    </p>
  </>
)
