/// <reference types="vitest" />
import { defineConfig } from "vite"

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      include: ["packages/**/src/**/*.{ts,tsx}"],
      exclude: ["**/index.ts"],
      reporter: "text", // CLI only
    },
  },
})
