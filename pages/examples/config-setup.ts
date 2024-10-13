// lib/yaasl.ts
import { reduxDevtools } from "@yaasl/devtools"
import { CONFIG } from "@yaasl/react"

const isDevServer = import.meta.env.DEV && import.meta.env.MODE !== "test"

CONFIG.name = "my-app-name"
CONFIG.globalEffects = [reduxDevtools({ disable: !isDevServer })]

export * from "@yaasl/react"
