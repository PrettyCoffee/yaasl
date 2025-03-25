import reactLogo from "./assets/react.svg"
import viteLogo from "./assets/vite.svg"
import { Counter } from "./counter"
import "./app.css"

export const App = () => (
  <>
    <div>
      <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
        <img src={viteLogo} className="logo" alt="Vite logo" />
      </a>
      <a href="https://react.dev" target="_blank" rel="noreferrer">
        <img src={reactLogo} className="logo react" alt="React logo" />
      </a>
    </div>
    <h1>Vite + React + yaasl</h1>
    <div className="card">
      <Counter />
    </div>
    <p className="read-the-docs">
      Click on the Vite and React logos to learn more
    </p>
  </>
)
