import prettyCozy from "@pretty-cozy/eslint-config"
import ts from "typescript-eslint"

export default ts.config(
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
  {
    ignores: ["docs/**", "**/node_modules/**", "**/dist/**"],
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
  prettyCozy.prettier
)
