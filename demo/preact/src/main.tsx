import { render } from "preact"

import { App } from "./app"
// oxlint-disable-next-line import/no-unassigned-import
import "./index.css"

const root = document.getElementById("root")
if (!root) throw new Error("Root element not found")

render(<App />, root)
