import cozy from "@pretty-cozy/oxlint-config"
import { defineConfig } from "oxlint"

const forbiddenGlobals = [
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "indexedDb",
  "location",
  "navigator",
  "history",
]

export default defineConfig({
  extends: [cozy.base, cozy.react, cozy.vitest],
  ignorePatterns: ["**/dist/**", "pnpm-lock.yaml"],
  categories: {
    correctness: "error",
    suspicious: "error",
    perf: "error",
  },
  options: {
    typeAware: true,
    typeCheck: true,
    reportUnusedDisableDirectives: "error",
    denyWarnings: true,
  },
  rules: {
    "typescript/no-floating-promises": "off",
    "typescript/no-explicit-any": "off",
  },
  overrides: [
    {
      files: ["packages/**"],
      excludeFiles: ["*.test.*"],
      rules: {
        "eslint/no-restricted-globals": [
          "error",
          ...forbiddenGlobals.map(globalVar => ({
            name: globalVar,
            message:
              "Don't access globals directly, they might not be defined in some environments. Use getWindow() instead.",
          })),
        ],
      },
    },
    {
      files: ["docs/**"],
      rules: {
        "promise/valid-params": "off",
      },
    },
  ],
})
