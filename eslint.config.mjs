import prettyCozy from "@pretty-cozy/eslint-config"
import { defineConfig, globalIgnores } from "eslint/config"

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

export default defineConfig([
  {
    files: ["**/*.js", "**/*.mjs"],
    extends: [prettyCozy.baseJs],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [prettyCozy.baseTs],
  },
  {
    files: ["packages/react/src/**"],
    extends: [prettyCozy.react],
  },
  {
    files: ["packages/preact/src/**"],
    extends: [prettyCozy.preact],
  },
  globalIgnores(["docs/**", "**/node_modules/**", "**/dist/**"]),
  {
    ignores: ["**/*.test.*", "demo/**"],
    rules: {
      "no-restricted-globals": [
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
    files: ["scripts/**"],
    rules: {
      "import/no-extraneous-dependencies": "off",
    },
  },
  {
    files: ["**/*.test.*"],
    rules: {
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
    },
  },

  prettyCozy.prettier,
])
